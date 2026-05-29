/**
 * src/api/virtualLover.js — 虚拟恋人 API
 *
 * 职责：
 *   • 调用后端 /api/lover/message 获取 Grok 文本生成结果
 *   • 调用后端 /api/lover/memory 清空记忆
 */

import { post, del, withRetry } from './client'

function resolveLang(lang) {
  return lang === 'en' ? 'en' : 'zh'
}

function normalizeServerLoverPayload(serverData = {}, lang = 'zh') {
  return {
    text: serverData.text || '',
    mood: serverData.mood || '温柔',
    provider: serverData.provider || '',
    fallback: Boolean(serverData.fallback),
    timestamp: serverData.timestamp || '',
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
    console.warn('❌ fetchVirtualLoverMessage 失败:', error.message)
    throw error
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
    console.warn('❌ clearVirtualLoverMemory 失败:', { reason: error.message })
    return {
      success: false,
      message: error.message,
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
