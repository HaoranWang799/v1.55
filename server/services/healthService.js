/**
 * server/services/healthService.js — Health Plan 业务逻辑服务
 *
 * 负责：
 * 1. 构建健康计划提示词
 * 2. 调用 provider 生成稳定结构
 * 3. 在 Grok 失败时自动降级到 fallback provider
 */

import { callProviderWithFallback } from '../providers/providerFactory.js'
import { PROVIDER_CONFIG } from '../config/providers.js'
import { ValidationError } from '../config/errors.js'

const HEALTH_VARIATION_CUES = {
  zh: [
    '优先变换饮食食材组合，保持建议可执行。',
    '优先变换运动安排描述，不要重复上次句式。',
    '保持结构稳定，但总结措辞和重点需要变化。',
    '优先从恢复角度切入，再给训练建议。',
    '优先从节奏控制角度切入，再给饮食建议。',
  ],
  en: [
    'Prioritize a different food combination while keeping the advice practical.',
    'Prioritize a different exercise arrangement and avoid repeating the previous phrasing.',
    'Keep the structure stable, but vary the summary wording and main focus.',
    'Start from a recovery angle, then give training advice.',
    'Start from rhythm control, then give diet advice.',
  ],
}

const recentHealthFingerprints = []

const HEALTH_PLAN_SYSTEM_PROMPT_ZH = `你是一名谨慎、实用的中文健康教练，擅长根据用户最近的身体表现与训练数据，生成具体、可执行的改善建议。

要求：
- 语气直接、专业、不过度夸张
- 输出必须可执行，避免空泛鸡汤
- 饮食建议要给出食物名称和作用
- 运动建议要给出频率、组数、时长或次数
- 下次震动频率建议要明确模式、说明和原因
- 总结要基于输入数据，不要编造成就或医学诊断
- 不要输出免责声明，不要输出额外解释

输出格式必须是严格 JSON：
{
  "summary": "一句到两句总结",
  "dietFocus": "饮食策略标题",
  "dietSuggestions": [
    {"name":"食物名","benefit":"具体作用"}
  ],
  "exerciseSuggestions": [
    {"name":"训练名","plan":"怎么做","reason":"为什么推荐"}
  ],
  "nextVibrationMode": {
    "mode": "模式名",
    "desc": "频率或节奏说明",
    "reason": "推荐原因"
  }
}

限制：
- dietSuggestions 固定 4 条
- exerciseSuggestions 固定 3 条
- 所有字段都必须返回
- 只输出 JSON。`

const HEALTH_PLAN_SYSTEM_PROMPT_EN = `You are a careful, practical English health coach who creates concrete, actionable improvement plans from the user's recent body-performance and training data.

Requirements:
- Write natural English only
- Be direct, professional, and not exaggerated
- Make every suggestion executable, not vague motivation
- Diet suggestions must include food names and specific benefits
- Exercise suggestions must include frequency, sets, duration, or reps
- The next vibration suggestion must include a clear mode, description, and reason
- Base the summary on the input data; do not invent medical conditions, lab results, achievements, or medication advice
- Do not include disclaimers or extra explanation outside the JSON

Return strict JSON only:
{
  "summary": "one to two sentence summary",
  "dietFocus": "diet strategy title",
  "dietSuggestions": [
    {"name":"food name","benefit":"specific benefit"}
  ],
  "exerciseSuggestions": [
    {"name":"training name","plan":"how to do it","reason":"why it is recommended"}
  ],
  "nextVibrationMode": {
    "mode": "mode name",
    "desc": "frequency or rhythm description",
    "reason": "recommendation reason"
  }
}

Limits:
- dietSuggestions must contain exactly 4 items
- exerciseSuggestions must contain exactly 3 items
- all fields are required
- output JSON only.`

function resolveLang(lang) {
  return lang === 'en' ? 'en' : 'zh'
}

function getHealthSystemPrompt(lang) {
  return resolveLang(lang) === 'en' ? HEALTH_PLAN_SYSTEM_PROMPT_EN : HEALTH_PLAN_SYSTEM_PROMPT_ZH
}

function formatWeeklyTrend(weeklyTrend = [], lang = 'zh') {
  const activeLang = resolveLang(lang)
  return weeklyTrend
    .map((item) => activeLang === 'en'
      ? `${item.dayEn || item.day}: ${item.label || '-'}, intensity bar ${item.heightPct ?? '-'}%`
      : `${item.day}: ${item.label || '-'}，强度柱值 ${item.heightPct ?? '-'}%`)
    .join(activeLang === 'en' ? '; ' : '；')
}

function pickHealthVariationCue(lang = 'zh') {
  const pool = HEALTH_VARIATION_CUES[resolveLang(lang)]
  return pool[Math.floor(Math.random() * pool.length)]
}

function createHealthFingerprint(plan) {
  return JSON.stringify({
    summary: String(plan?.summary || '').trim(),
    diet: Array.isArray(plan?.dietSuggestions) ? plan.dietSuggestions.map((item) => item.name).join('|') : '',
    exercise: Array.isArray(plan?.exerciseSuggestions) ? plan.exerciseSuggestions.map((item) => item.name).join('|') : '',
    vibration: String(plan?.nextVibrationMode?.mode || '').trim(),
  })
}

function rememberHealthFingerprint(plan) {
  const fingerprint = createHealthFingerprint(plan)
  if (!fingerprint) return
  recentHealthFingerprints.unshift(fingerprint)
  if (recentHealthFingerprints.length > 5) recentHealthFingerprints.length = 5
}

function hasRecentDuplicateHealthPlan(plan) {
  const fingerprint = createHealthFingerprint(plan)
  return Boolean(fingerprint) && recentHealthFingerprints.includes(fingerprint)
}

function buildHealthUserPrompt(payload) {
  const activeLang = resolveLang(payload.lang)
  const todayStats = payload.todayStats || {}
  const weeklyTrend = Array.isArray(payload.weeklyTrend) ? payload.weeklyTrend : []
  const detailSummary = payload.detailSummary || {}

  if (activeLang === 'en') {
    return `Based on the following health data, generate a realistic, executable English training plan for the user.

Today's data:
- Overall score: ${todayStats.score ?? 'unknown'}
- Session duration: ${todayStats.duration ?? 'unknown'}
- Current status: ${todayStats.status ?? 'unknown'}
- Content intensity: ${todayStats.intensity ?? 'unknown'}
- Softness period: ${todayStats.softSecs ?? 'unknown'} seconds
- Firmness duration: ${todayStats.hardMin ?? 'unknown'} min ${todayStats.hardSec ?? 'unknown'} sec
- Hardness score: ${todayStats.hardScore ?? 'unknown'}

7-day trend: ${formatWeeklyTrend(weeklyTrend, activeLang) || 'none'}

Extra summary:
- 7-day average duration: ${detailSummary.avgDuration ?? 'unknown'}
- Status distribution: ${detailSummary.statusDistribution ?? 'unknown'}
- My average intensity: ${detailSummary.myAvgIntensity ?? 'unknown'}
- Platform average intensity: ${detailSummary.platformAvgIntensity ?? 'unknown'}
- Hardness trend: ${detailSummary.hardTrend ?? 'unknown'}

Goals:
- Make the advice specific and suitable for the next 7 days
- Diet should prioritize recovery, blood flow, zinc/magnesium, and sleep rhythm
- Exercise should prioritize pelvic floor, core, and cardio
- The next vibration frequency suggestion must match the current state
- Do not invent lab results, diseases, or medication advice
- Variation cue: ${pickHealthVariationCue(activeLang)}
- Generation id: ${Date.now()}-${Math.random().toString(36).slice(2, 8)}
${recentHealthFingerprints.length ? `- Avoid repeating recent plan fingerprints: ${recentHealthFingerprints.join(' || ')}` : ''}`
  }

  return `请基于以下健康数据，为用户生成一个真实可执行的中文训练计划。

今日数据：
- 综合评分：${todayStats.score ?? '未知'}
- 使用时长：${todayStats.duration ?? '未知'}
- 当前状态：${todayStats.status ?? '未知'}
- 内容激烈度：${todayStats.intensity ?? '未知'}
- 疲软期：${todayStats.softSecs ?? '未知'} 秒
- 强硬度时间：${todayStats.hardMin ?? '未知'} 分 ${todayStats.hardSec ?? '未知'} 秒
- 硬度评分：${todayStats.hardScore ?? '未知'}

近 7 天趋势：${formatWeeklyTrend(weeklyTrend) || '暂无'}

补充摘要：
- 近7天平均时长：${detailSummary.avgDuration ?? '未知'}
- 状态分布：${detailSummary.statusDistribution ?? '未知'}
- 我的平均激烈度：${detailSummary.myAvgIntensity ?? '未知'}
- 平台平均激烈度：${detailSummary.platformAvgIntensity ?? '未知'}
- 硬度趋势：${detailSummary.hardTrend ?? '未知'}

目标：
- 让建议尽量具体，适合未来 7 天执行
- 饮食优先围绕恢复、血流、锌镁、作息
- 运动优先围绕骨盆底肌、核心、有氧
- 下次震动频率建议要与当前状态匹配
- 不要编造化验、疾病、药物建议
- 本次变体要求：${pickHealthVariationCue(activeLang)}
- 本次生成标识：${Date.now()}-${Math.random().toString(36).slice(2, 8)}
${recentHealthFingerprints.length ? `- 避免重复最近计划指纹：${recentHealthFingerprints.join(' || ')}` : ''}`
}

function normalizeHealthPlan(result, lang = 'zh') {
  const activeLang = resolveLang(lang)

  return {
    summary: String(result?.summary || (activeLang === 'en'
      ? 'Based on your current data, keep the rhythm stable and prioritize recovery with light training.'
      : '根据当前数据建议先稳住节奏，优先恢复与轻量训练。')).trim(),
    dietFocus: String(result?.dietFocus || (activeLang === 'en' ? 'Recovery First' : '恢复优先')).trim(),
    dietSuggestions: Array.isArray(result?.dietSuggestions)
      ? result.dietSuggestions.slice(0, 4).map((item) => ({
          name: String(item?.name || '').trim(),
          benefit: String(item?.benefit || '').trim(),
        })).filter((item) => item.name && item.benefit)
      : [],
    exerciseSuggestions: Array.isArray(result?.exerciseSuggestions)
      ? result.exerciseSuggestions.slice(0, 3).map((item) => ({
          name: String(item?.name || '').trim(),
          plan: String(item?.plan || '').trim(),
          reason: String(item?.reason || '').trim(),
        })).filter((item) => item.name && item.plan)
      : [],
    nextVibrationMode: {
      mode: String(result?.nextVibrationMode?.mode || (activeLang === 'en' ? 'Steady Rhythm' : '稳定节奏')).trim(),
      desc: String(result?.nextVibrationMode?.desc || (activeLang === 'en' ? 'Start low to mid frequency and build gradually' : '中低频起步，逐步加速')).trim(),
      reason: String(result?.nextVibrationMode?.reason || (activeLang === 'en' ? 'Your current state is better suited to stable rhythm and sensation first' : '当前更适合先稳定感受与节奏')).trim(),
    },
    provider: result?.provider || 'fallback',
    fallback: Boolean(result?.fallback),
    timestamp: result?.timestamp || new Date().toISOString(),
    error: result?.fallbackError || '',
    lang: activeLang,
  }
}

/**
 * 验证健康计划请求参数
 */
function validatePlanPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new ValidationError('payload 必须是对象')
  }

  // 所有字段都是可选的 -健康计划可以从部分数据生成
  return true
}

/**
 * 生成健康计划
 *
 * 参数：
 *   payload: {
 *     todayStats: { step, heartRate, ... },
 *     barData: { exercise_time, heart_rate_zone, ... },
 *     durationDetail: { ... },
 *     statusDetail: { ...}, // optional
 *     intensityDetail: {...}, // optional
 *     hardDetail: {...} // optional
 *   }
 *
 * 返回：
 *   {
 *     summary: string,
 *     diet: {tips: [...], recommended: [...]},
 *     exercise: {tips: [...], intensity: string},
 *     vibrationMode: string,
 *     recovery: {tips: [...]},
 *     _provider: 'grok' | 'mock',
 *     _fallback: boolean,
 *     timestamp: ISO string
 *   }
 */
export async function generateHealthPlan(payload, apiKeyOverride = '') {
  // 验证入参
  try {
    validatePlanPayload(payload)
  } catch (error) {
    console.error('❌ [HealthService] 参数验证失败:', error.message)
    throw error
  }

  // 获取 provider 配置
  const activeLang = resolveLang(payload.lang)
  const config = PROVIDER_CONFIG.health
  const promptPayload = {
    systemPrompt: getHealthSystemPrompt(activeLang),
    userPrompt: buildHealthUserPrompt(payload),
    lang: activeLang,
    temperature: 0.82,
    maxTokens: 700,
    timeoutMs: config.timeouts.primary,
  }

  try {
    console.log('📋 [HealthService] 生成健康计划...')

    // 使用 provider 生成计划
    let result = normalizeHealthPlan(await callProviderWithFallback(
      config.primary,
      config.fallback,
      'generateHealthPlan',
      [promptPayload, apiKeyOverride],
      {
        primaryTimeout: config.timeouts.primary,
        fallbackTimeout: config.timeouts.fallback,
      }
    ), activeLang)

    if (hasRecentDuplicateHealthPlan(result)) {
      result = normalizeHealthPlan(await callProviderWithFallback(
        config.primary,
        config.fallback,
        'generateHealthPlan',
        [{
          ...promptPayload,
          userPrompt: `${buildHealthUserPrompt(payload)}
- ${activeLang === 'en'
  ? 'Hard requirement: this plan must be clearly different from the recent one, especially the summary, dietSuggestions names, and exerciseSuggestions names.'
  : '强制要求：本次内容必须明显区别于最近一次，尤其是 summary、dietSuggestions 名称和 exerciseSuggestions 名称。'}`,
          temperature: 0.95,
        }, apiKeyOverride],
        {
          primaryTimeout: config.timeouts.primary,
          fallbackTimeout: config.timeouts.fallback,
        }
      ), activeLang)
    }

    rememberHealthFingerprint(result)

    return result
  } catch (error) {
    console.error('❌ [HealthService] 健康计划生成失败:', error.message)
    throw error
  }
}

/**
 * 获取今日健康评分
 * （某些场景下前端需要单独的评分接口）
 */
export async function getTodayHealthScore(stats) {
  if (!stats || typeof stats !== 'object') {
    throw new ValidationError('stats 必须是对象')
  }

  // 简单评分逻辑（如果需要 AI 评分，也调用 provider）
  const { step = 0, heartRate = 0, sleepHours = 0 } = stats

  const stepScore = Math.min((step / 10000) * 100, 100)
  const sleepScore = Math.min((sleepHours / 8) * 100, 100)
  const score = Math.round((stepScore + sleepScore) / 2)

  return {
    score,
    details: {
      step: stepScore,
      sleep: sleepScore,
    },
    timestamp: new Date().toISOString(),
  }
}

export default {
  generateHealthPlan,
  getTodayHealthScore,
}
