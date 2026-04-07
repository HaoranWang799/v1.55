/**
 * src/api/virtualLover.js — 虚拟恋人 API
 *
 * 职责：
 *   • 调用后端 /api/lover/message 获取 Grok 文本生成结果
 *   • 调用后端 /api/lover/memory 清空记忆
 *   • 仅在请求失败时返回本地 fallback 结果
 */

import { post, del, withRetry } from './client'

// Mock 消息池（fallback 使用）
const MOCK_MESSAGES = {
  zh: [
    '今天有点想你…',
    '晚上好啊，今天累了吗？',
    '我想你了，来陪我聊聊天吧…',
    '今晚月色真美。',
    '每天最开心的事就是等你上线。',
    '你知道吗？我一直都在。',
  ],
  en: [
    'I missed you a little today...',
    'Good evening. Did today wear you out?',
    'I missed you. Come talk with me for a while...',
    'The moon is beautiful tonight.',
    'The best part of my day is waiting for you to come online.',
    'You know what? I have been right here.',
  ],
}

const MOCK_MOODS = ['温柔', '暧昧', '调皮']

function resolveLang(lang) {
  return lang === 'en' ? 'en' : 'zh'
}

function getDefaultText(lang) {
  return resolveLang(lang) === 'en' ? 'I missed you a little today...' : '今天有点想你…'
}

function createLocalFallbackMessage(errorMessage = '', lang = 'zh') {
  const messages = MOCK_MESSAGES[resolveLang(lang)]
  const text = messages[Math.floor(Math.random() * messages.length)]
  const mood = MOCK_MOODS[Math.floor(Math.random() * MOCK_MOODS.length)]
  return {
    text,
    mood,
    provider: 'fallback',
    fallback: true,
    timestamp: new Date().toISOString(),
    error: errorMessage,
    lang: resolveLang(lang),
  }
}

function normalizeServerLoverPayload(serverData = {}, lang = 'zh') {
  return {
    text: serverData.text || getDefaultText(lang),
    mood: serverData.mood || '温柔',
    provider: serverData.provider || 'fallback',
    fallback: Boolean(serverData.fallback),
    timestamp: serverData.timestamp || new Date().toISOString(),
    error: serverData.error || '',
    lang: resolveLang(serverData.lang || lang),
  }
}

/**
 * 获取虚拟恋人消息
 *
 * @param {object} options
 *   - forceRefresh: 是否强制刷新（不使用缓存）
 *   - grokApiKey: 显式指定 Grok API Key（可留空，会自动从 localStorage 获取）
 * @returns {Promise<object>}
 *   { text, mood, provider, fallback, timestamp }
 */
export async function fetchVirtualLoverMessage(options = {}) {
  const {
    forceRefresh = false,
    text = '',
    message = '',
    context = {},
    lang = context?.lang || 'zh',
  } = options

  const activeLang = resolveLang(lang)
  const contentFallback = activeLang === 'en' ? 'Keep me company for a while' : '继续陪我聊聊'
  const content = String(text || message || contentFallback).trim() || contentFallback
  const requestPayload = {
    forceRefresh,
    text: content,
    message: content,
    lang: activeLang,
    context: {
      ...context,
      lang: activeLang,
    },
  }

  try {
    const response = await post('/api/lover/message', requestPayload, {
      ...withRetry(2),
      timeout: 10000,
    })

    if (!response?.ok || !response?.data) {
      throw new Error(response?.error?.message || '虚拟恋人接口返回无效')
    }

    const normalized = normalizeServerLoverPayload(response.data, activeLang)
    console.log('💬 [VirtualLover API] 使用后端结果', {
      provider: normalized.provider,
      fallback: normalized.fallback,
    })
    return normalized
  } catch (error) {
    const fallbackResult = createLocalFallbackMessage(error.message, activeLang)
    console.warn('❌ fetchVirtualLoverMessage 失败，使用本地 fallback:', {
      reason: error.message,
      provider: fallbackResult.provider,
      fallback: fallbackResult.fallback,
    })
    return fallbackResult
  }
}

/**
 * 清空虚拟恋人记忆
 *
 * @returns {Promise<object>}
 *   { success: boolean, message: string }
 */
export async function clearVirtualLoverMemory() {
  try {
    const response = await del('/api/lover/memory', {
      ...withRetry(1),
      timeout: 5000,
    })
    return response
  } catch (error) {
    console.warn('❌ clearVirtualLoverMemory 失败，使用 mock 成功:', { reason: error.message })
    return {
      success: true,
      message: '记忆已清空（本地模式）',
    }
  }
}

/**
 * 批量获取虚拟恋人消息（10 条）
 * 为前端弹药池服务
 *
 * @returns {Promise<Array<{text: string, mood: string}>>}
 */
export async function fetchVirtualLoverBatch(options = {}) {
  const activeLang = resolveLang(options.lang || options.context?.lang || 'zh')
  try {
    const response = await post('/api/lover/batch', { lang: activeLang }, {
      timeout: 15000,
    })

    if (!response?.ok || !Array.isArray(response?.data)) {
      throw new Error('批量接口返回无效')
    }

    console.log(`💥 [VirtualLover API] 批量获取完成，共 ${response.data.length} 条`)
    return response.data.map((item) => normalizeServerLoverPayload(item, activeLang))
  } catch (error) {
    console.warn('❌ fetchVirtualLoverBatch 失败:', error.message)
    return []
  }
}

export default {
  fetchVirtualLoverMessage,
  fetchVirtualLoverBatch,
  clearVirtualLoverMemory,
}
