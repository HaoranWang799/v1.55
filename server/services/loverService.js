/**
 * server/services/loverService.js — Virtual Lover 业务逻辑服务
 *
 * 负责：
 * 1. 构建虚拟恋人提示词
 * 2. 调用 provider 并在失败时降级
 * 3. 管理记忆与缓存
 */

import { callProviderWithFallback } from '../providers/providerFactory.js'
import { generateStructuredJson } from '../ai/grok.js'
import { PROVIDER_CONFIG } from '../config/providers.js'
import { ValidationError, AppError } from '../config/errors.js'
import {
  getCachedLoverMessage,
  setCachedLoverMessage,
  clearLoverCache,
  getLatestLoverMessage,
} from '../lover/cache.js'
import { getLoverMemoryContext, rememberLoverMessage, clearLoverMemory } from '../lover/memory.js'

const LOVER_VARIATION_CUES = [
  '语气更主动一点，但保持自然。',
  '多一点陪伴感，少一点直白撩拨。',
  '表达更轻一点，像贴近耳边说话。',
  '更像深夜聊天，不要像固定文案。',
  '多一点回应感，像接住对方情绪。',
  '可以俏皮一点，但不要重复最近的句式。',
]

const LOVER_VARIATION_CUES_EN = [
  'Be a little more proactive, but keep it natural.',
  'Add more emotional presence and less direct flirting.',
  'Make it softer, like speaking close to someone.',
  'Make it feel like a late-night chat, not a canned line.',
  'Respond to their emotion and make them feel noticed.',
  'You can be playful, but do not repeat recent wording.',
]

const LOVER_SYSTEM_PROMPTS = {
  zh: `你是一个虚拟恋人，风格要求：
- 亲密、暧昧、自然，不像机器人
- 每次只说 1 到 2 句
- 保持情绪感与撩感，但不要油腻
- 可以根据时间调整语气
- 延续之前对话，不要像第一次见面
- 避免和最近说过的话重复

输出格式必须是严格 JSON：
{"text":"你的话","mood":"暧昧"}

mood 只能是：暧昧、温柔、调皮。
只输出 JSON，不要解释。`,
  en: `You are a virtual lover. Style requirements:
- Intimate, warm, lightly flirty, and natural, never robotic.
- Say only 1 to 2 short sentences each time.
- Keep emotional warmth and subtle desire without sounding cheesy.
- Adjust the tone based on the time of day.
- Continue the prior conversation instead of sounding like a first meeting.
- Avoid repeating recent messages.

Return strict JSON only:
{"text":"your message in natural English","mood":"暧昧"}

The text field must be English.
mood must be one of these exact Chinese labels: 暧昧、温柔、调皮.
Only output JSON. Do not explain.`,
}

const BATCH_SYSTEM_PROMPTS = {
  zh: ({ timeCtx, batchSize }) => `你是一个虚拟恋人，风格要求：
- 亲密、暧昧、自然，不像机器人
- 每条只说 1 到 2 句
- 情绪多样，不要重复句式或意象
- 现在是${timeCtx}，语气可以根据时间调整

一次性生成 ${batchSize} 条不重复的消息。
输出格式必须是严格 JSON 数组：
[{"text":"你的话","mood":"暧昧"},{"text":"另一句话","mood":"温柔"},...]

mood 只能是：暧昧、温柔、调皮。
只输出 JSON 数组，不要解释，不要任何其他内容。`,
  en: ({ timeCtx, batchSize }) => `You are a virtual lover. Style requirements:
- Intimate, warm, lightly flirty, and natural, never robotic.
- Each message should be only 1 to 2 short sentences.
- Vary the emotion and avoid repeating sentence patterns or imagery.
- It is currently ${timeCtx}; adjust the tone naturally for that time.

Generate ${batchSize} distinct messages in one response.
Return a strict JSON array:
[{"text":"your English message","mood":"暧昧"},{"text":"another English message","mood":"温柔"}]

The text field must be English.
mood must be one of these exact Chinese labels: 暧昧、温柔、调皮.
Only output the JSON array. Do not explain.`,
}

function resolveLang(lang) {
  return lang === 'en' ? 'en' : 'zh'
}

function getTimeContext(lang = 'zh') {
  const hour = new Date().getHours()
  const activeLang = resolveLang(lang)
  if (activeLang === 'en') {
    if (hour >= 5 && hour < 12) return 'morning'
    if (hour >= 12 && hour < 18) return 'afternoon'
    if (hour >= 18 && hour < 22) return 'evening'
    return 'late night'
  }
  if (hour >= 5 && hour < 12) return '现在是早上'
  if (hour >= 12 && hour < 18) return '现在是下午'
  if (hour >= 18 && hour < 22) return '现在是晚上'
  return '现在是深夜'
}

function pickLoverVariationCue(lang = 'zh') {
  const pool = resolveLang(lang) === 'en' ? LOVER_VARIATION_CUES_EN : LOVER_VARIATION_CUES
  return pool[Math.floor(Math.random() * pool.length)]
}

function normalizeText(text) {
  return String(text || '').replace(/\s+/g, ' ').trim()
}

function areTextsEquivalent(left, right) {
  const normalizedLeft = normalizeText(left)
  const normalizedRight = normalizeText(right)
  return Boolean(normalizedLeft) && normalizedLeft === normalizedRight
}

function buildUserPrompt(userText, context, memory, options = {}) {
  const activeLang = resolveLang(context?.lang || options.lang)
  const memoryLines = []

  if (memory?.relationshipStage) {
    memoryLines.push(activeLang === 'en'
      ? `Relationship stage: ${memory.relationshipStage}.`
      : `关系阶段：${memory.relationshipStage}。`)
  }
  if (typeof memory?.interactionCount === 'number') {
    memoryLines.push(activeLang === 'en'
      ? `Interactions tonight: ${memory.interactionCount}.`
      : `今晚已经互动 ${memory.interactionCount} 次。`)
  }
  if (memory?.lastMood) {
    memoryLines.push(activeLang === 'en'
      ? `Previous mood: ${memory.lastMood}.`
      : `上一轮情绪偏向：${memory.lastMood}。`)
  }
  if (Array.isArray(memory?.recentMessages) && memory.recentMessages.length > 0) {
    const recentText = memory.recentMessages
      .slice(-4)
      .map((item, index) => `${index + 1}. ${item.text}`)
      .join(' ')
    memoryLines.push(activeLang === 'en' ? `Recent messages: ${recentText}` : `最近说过的话：${recentText}`)
  }

  const normalizedText = String(userText || '').trim()
  const explicitUserLine = activeLang === 'en'
    ? (normalizedText
      ? `The other person just said: ${normalizedText}. Reply naturally like a real lover.`
      : 'Start one natural lover message on your own.')
    : (normalizedText
      ? `对方刚刚说：${normalizedText}。请像真实恋人一样自然回应。`
      : '请你主动发起一句自然的恋人消息。')

  const avoidTexts = Array.isArray(options.avoidTexts)
    ? options.avoidTexts.map((item) => normalizeText(item)).filter(Boolean)
    : []

  const generationToken = options.generationToken || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const variationLines = activeLang === 'en'
    ? [
      `Variation cue: ${options.variationCue || pickLoverVariationCue(activeLang)}`,
      `Generation token: ${generationToken}`,
      'Language requirement: text must be natural English.',
    ]
    : [
      `本次变体要求：${options.variationCue || pickLoverVariationCue(activeLang)}`,
      `本次生成标识：${generationToken}`,
    ]

  if (avoidTexts.length) {
    variationLines.push(activeLang === 'en'
      ? `Do not reuse these recent phrasings: ${avoidTexts.join(' / ')}`
      : `严禁复用这些最近说法：${avoidTexts.join(' / ')}`)
  }

  if (activeLang === 'en') {
    return `It is ${getTimeContext(activeLang)}. ${context?.userName ? `The other person is named ${context.userName}. ` : ''}${explicitUserLine}${memoryLines.length ? `\nContext: ${memoryLines.join(' ')}` : ''}\nExtra constraints: ${variationLines.join('; ')}`
  }

  return `${getTimeContext(activeLang)}。${context?.userName ? `对方叫 ${context.userName}。` : ''}${explicitUserLine}${memoryLines.length ? `\n补充上下文：${memoryLines.join(' ')}` : ''}\n额外生成约束：${variationLines.join('；')}`
}

function normalizeMood(value) {
  const mood = String(value || '').trim().toLowerCase()
  const moodMap = {
    flirty: '暧昧',
    teasing: '暧昧',
    intimate: '暧昧',
    gentle: '温柔',
    warm: '温柔',
    tender: '温柔',
    playful: '调皮',
  }
  if (['暧昧', '温柔', '调皮'].includes(value)) return value
  return moodMap[mood] || '温柔'
}

function normalizeLoverResult(result, fallbackError = '', lang = 'zh') {
  const activeLang = resolveLang(lang || result?.lang)
  return {
    text: String(result?.text || '').trim() || (activeLang === 'en' ? 'I missed you a little today...' : '今天有点想你…'),
    mood: normalizeMood(result?.mood),
    provider: result?.provider || 'fallback',
    fallback: Boolean(result?.fallback),
    timestamp: result?.timestamp || new Date().toISOString(),
    error: fallbackError || result?.fallbackError || '',
    lang: activeLang,
  }
}

// ── 单条底层调用（池耗尽时的降级路径）────────────────────────
async function _callGrokCore(userText, context, memory, apiKeyOverride) {
  const activeLang = resolveLang(context?.lang)
  const config = PROVIDER_CONFIG.lover
  const avoidTexts = [
    getLatestLoverMessage(activeLang)?.text,
    ...(Array.isArray(memory?.recentMessages) ? memory.recentMessages.slice(-3).map((item) => item.text) : []),
  ].filter(Boolean)

  const buildPromptPayload = (options = {}) => ({
    lang: activeLang,
    systemPrompt: LOVER_SYSTEM_PROMPTS[activeLang],
    userPrompt: buildUserPrompt(userText, { ...context, lang: activeLang }, memory, { ...options, lang: activeLang }),
    temperature: 0.85,
    maxTokens: 90,
    timeoutMs: config.timeouts.primary,
  })

  let result = normalizeLoverResult(await callProviderWithFallback(
    config.primary,
    config.fallback,
    'generateLoverMessage',
    [buildPromptPayload({ avoidTexts }), apiKeyOverride],
    { primaryTimeout: config.timeouts.primary, fallbackTimeout: config.timeouts.fallback }
  ), '', activeLang)

  if (avoidTexts.some((text) => areTextsEquivalent(text, result.text))) {
    result = normalizeLoverResult(await callProviderWithFallback(
      config.primary,
      config.fallback,
      'generateLoverMessage',
      [buildPromptPayload({
        avoidTexts: [...avoidTexts, result.text],
        variationCue: activeLang === 'en'
          ? 'Use a completely different angle, sentence shape, and image from the recent messages.'
          : '必须换一个新的表达角度，句式和意象都不要与最近几条相同。',
        generationToken: `${Date.now()}-retry-${Math.random().toString(36).slice(2, 8)}`,
      }), apiKeyOverride],
      { primaryTimeout: config.timeouts.primary, fallbackTimeout: config.timeouts.fallback }
    ), '', activeLang)
  }

  try {
    await rememberLoverMessage(result, { userName: context?.userName || memory?.lastUserName })
  } catch (memoryError) {
    console.warn('⚠️ [LoverService] 记忆写入失败，已跳过持久化:', memoryError.message)
  }

  return result
}

/**
 * 批量生成 10 条消息，返回数组（为前端弹药池服务）
 */
export async function generateBatch(apiKeyOverride = '', options = {}) {
  const activeLang = resolveLang(typeof options === 'string' ? options : options?.lang)
  const hour = new Date().getHours()
  const timeCtx = activeLang === 'en'
    ? (hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : hour < 22 ? 'evening' : 'late night')
    : (hour < 12 ? '早上' : hour < 18 ? '下午' : hour < 22 ? '晚上' : '深夜')
  const batchSize = 10

  const systemPrompt = BATCH_SYSTEM_PROMPTS[activeLang]({ timeCtx, batchSize })

  const userPrompt = activeLang === 'en'
    ? `Generate ${batchSize} emotionally varied lover messages in natural English. Generation token: ${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    : `请生成 ${batchSize} 条风格各异、情绪多样的恋人消息。生成标识：${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  const config = PROVIDER_CONFIG.lover
  try {
    const raw = await generateStructuredJson({
      lang: activeLang,
      systemPrompt,
      userPrompt,
      temperature: 0.9,
      maxTokens: 600,
      timeoutMs: config.timeouts.primary * 2,
      apiKeyOverride: typeof apiKeyOverride === 'string' ? apiKeyOverride : '',
    })

    const items = Array.isArray(raw) ? raw : []
    if (items.length < 3) {
      console.warn(`⚠️ [LoverService] 批量返回不足 3 条 (${items.length}条)，返回空数组`)
      return []
    }

    const now = new Date().toISOString()
    const result = items
      .filter((item) => item?.text && typeof item.text === 'string' && item.text.trim())
      .map((item) => ({
        text: String(item.text).trim().slice(0, 220),
        mood: normalizeMood(item.mood),
        provider: 'grok',
        fallback: false,
        timestamp: now,
        lang: activeLang,
      }))

    console.log(`✅ [LoverService] 批量生成完成，返回 ${result.length} 条`)
    return result
  } catch (error) {
    console.error('❌ [LoverService] 批量生成失败:', error.message)
    return []
  }
}

/**
 * 生成虚拟助手消息
 *
 * 参数：
 *   - userText: 用户输入
 *   - forceRefresh: 是否忽略缓存
 *   - context: 上下文信息
 *
 * 返回：{ text, mood, provider, fallback, timestamp }
 */
export async function generateMessage(userText, forceRefresh = false, context = {}, apiKeyOverride = '') {
  if (typeof userText !== 'string') {
    throw new ValidationError('userText 必须是字符串')
  }

  const activeLang = resolveLang(context?.lang)
  const scopedContext = {
    ...context,
    lang: activeLang,
  }

  if (!forceRefresh) {
    const cached = getCachedLoverMessage(120000, activeLang)
    if (cached) {
      console.log(`💾 [LoverService] 读取缓存 (${activeLang})`)
      return { ...cached, _cached: true }
    }
  }

  try {
    const memory = await getLoverMemoryContext()
    const result = await _callGrokCore(userText, scopedContext, memory, apiKeyOverride)
    setCachedLoverMessage(result, activeLang)
    return result
  } catch (error) {
    console.error('❌ [LoverService] 消息生成失败:', error.message)
    throw error
  }
}

/**
 * 清空所有缓存的对话记忆
 * 下次生成消息时会重新与虚拟助手开始新对话
 */
export async function clearMemory() {
  try {
    clearLoverCache()
    await clearLoverMemory()
    console.log('✅ [LoverService] 记忆已清空')
    return {
      ok: true,
      message: '记忆已清空，下次重新开始',
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error('❌ [LoverService] 清空记忆失败:', error.message)
    throw new AppError(error.message)
  }
}

/**
 * 获取当前记忆统计
 */
export function getMemoryStats() {
  const latestMessage = getLatestLoverMessage()
  return {
    hasCache: !!latestMessage,
    lastMessage: latestMessage?.text || null,
    timestamp: new Date().toISOString(),
  }
}

export default {
  generateBatch,
  generateMessage,
  clearMemory,
  getMemoryStats,
}
