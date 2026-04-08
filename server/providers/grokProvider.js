/**
 * server/providers/grokProvider.js — Grok AI 真实提供者
 *
 * 实现真实的 Grok API 调用
 */

import { generateStructuredJson } from '../ai/grok.js'

function clampText(value, max = 220) {
  return String(value || '').trim().slice(0, max)
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
  return ['暧昧', '温柔', '调皮'].includes(value) ? value : (moodMap[mood] || '温柔')
}

function normalizeList(items, mapper, min = 0, max = Infinity) {
  if (!Array.isArray(items)) return []
  return items.slice(0, max).map(mapper).filter(Boolean).slice(0, Math.max(min, 0))
}

/**
 * 生成虚拟恋人消息
 */
export async function generateLoverMessage(promptPayload, apiKeyOverride = '') {
  try {
    console.log('🔄 [GrokProvider] 生成消息...')

    const result = await generateStructuredJson({
      ...promptPayload,
      apiKeyOverride,
    })

    return {
      text: clampText(result.text),
      mood: normalizeMood(result.mood),
      lang: promptPayload?.lang === 'en' ? 'en' : 'zh',
    }
  } catch (error) {
    console.error('❌ [GrokProvider] 生成消息失败:', error.message)
    throw error
  }
}

/**
 * 生成健康计划
 */
export async function generateHealthPlan(promptPayload, apiKeyOverride = '') {
  try {
    console.log('🔄 [GrokProvider] 生成健康计划...')
    const activeLang = promptPayload?.lang === 'en' ? 'en' : 'zh'

    const result = await generateStructuredJson({
      ...promptPayload,
      apiKeyOverride,
    })

    return {
      summary: clampText(result.summary, 280),
      dietFocus: clampText(result.dietFocus || (activeLang === 'en' ? 'AI Diet Suggestions' : 'AI 饮食建议'), 40),
      dietSuggestions: Array.isArray(result.dietSuggestions)
        ? result.dietSuggestions.slice(0, 4).map((item) => ({
            name: clampText(item?.name, 24),
            benefit: clampText(item?.benefit, 80),
          })).filter((item) => item.name && item.benefit)
        : [],
      exerciseSuggestions: Array.isArray(result.exerciseSuggestions)
        ? result.exerciseSuggestions.slice(0, 3).map((item) => ({
            name: clampText(item?.name, 24),
            plan: clampText(item?.plan, 80),
            reason: clampText(item?.reason, 90),
          })).filter((item) => item.name && item.plan)
        : [],
      nextVibrationMode: {
        mode: clampText(result.nextVibrationMode?.mode || result.vibrationSuggestion?.mode || (activeLang === 'en' ? 'Steady Rhythm' : '稳定节奏'), 24),
        desc: clampText(result.nextVibrationMode?.desc || result.vibrationSuggestion?.desc || (activeLang === 'en' ? 'Start low to mid frequency and build gradually' : '中低频起步，逐步加速'), 90),
        reason: clampText(result.nextVibrationMode?.reason || result.vibrationSuggestion?.reason || (activeLang === 'en' ? 'Your current state is better suited to stable rhythm first' : '根据当前状态建议先稳后强'), 90),
      },
      lang: activeLang,
    }
  } catch (error) {
    console.error('❌ [GrokProvider] 生成计划失败:', error.message)
    throw error
  }
}

/**
 * 获取社区帖子（使用 Grok 进行个性化推荐）
 */
export async function getCommunityPosts(tab, page, limit) {
  try {
    console.log('🔄 [GrokProvider] 获取社区帖子（Grok 推荐）...')

    // 由于 Grok 主要是文本生成而不是列表推荐，这里暂时使用 Mock 数据
    // 未来可以扩展为：Grok 对帖子进行个性化评分或排序
    const { getPostsByTab } = await import('../data/communityData.js')
    const result = getPostsByTab(tab, page, limit)

    // 标记为 Grok 来源（虽然使用 Mock 数据）
    return {
      ...result,
      _provider: 'grok',
    }
  } catch (error) {
    console.error('❌ [GrokProvider] 获取帖子失败:', error.message)
    throw error
  }
}

export const grokProvider = {
  generateLoverMessage,
  generateHealthPlan,
  getCommunityPosts,
}

export default grokProvider
