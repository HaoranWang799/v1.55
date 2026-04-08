/**
 * src/api/healthPlan.js — 健康计划 API
 *
 * 职责：
 *   • 调用后端 /api/health/plan 生成 AI 智能训练计划
 *   • 仅在请求失败时回退到本地模板
 */

import { seedPlans } from '../data/seedPlans'
import { post, withRetry } from './client'

const EN_LOCAL_FALLBACK_PLAN = {
  summary: 'Your recent pattern suggests a recovery-first week: keep intensity controlled, support blood flow, and rebuild consistency before adding more load.',
  dietFocus: 'Recovery First',
  dietSuggestions: [
    { name: 'Eggs', benefit: 'Quality protein supports muscle repair and steady recovery.' },
    { name: 'Spinach', benefit: 'Magnesium helps ease fatigue and supports circulation.' },
    { name: 'Blueberries', benefit: 'Antioxidants help reduce stress after higher-intensity sessions.' },
    { name: 'Pumpkin Seeds', benefit: 'Zinc and magnesium support recovery and hormonal balance.' },
  ],
  exerciseSuggestions: [
    { name: 'Kegel Training', plan: '3 sets daily, 10 reps each, 5-second hold', reason: 'Builds pelvic floor control with a manageable daily load.' },
    { name: 'Brisk Walk', plan: '5 times weekly, 25 minutes each', reason: 'Improves circulation without adding too much recovery stress.' },
    { name: 'Hip Stretching', plan: '10 minutes every evening', reason: 'Reduces hip and lower-back tightness from long sitting.' },
  ],
  vibrationSuggestion: {
    mode: 'Steady Rhythm',
    desc: 'Start low to mid frequency and increase gradually.',
    reason: 'Your current state is better suited to a stable rhythm before stronger stimulation.',
  },
}

function resolveLang(lang) {
  return lang === 'en' ? 'en' : 'zh'
}

function buildCompatibleHealthPayload(payload = {}) {
  const todayStats = payload.todayStats || {}
  const weeklyTrend = Array.isArray(payload.weeklyTrend) ? payload.weeklyTrend : []
  const detailSummary = payload.detailSummary || {}

  return {
    ...payload,
    todayStats,
    weeklyTrend,
    detailSummary,
    // 兼容旧后端字段
    barData: weeklyTrend,
    durationDetail: {
      avgDuration: detailSummary.avgDuration || todayStats.duration || '',
    },
    statusDetail: {
      distribution: detailSummary.statusDistribution || '',
    },
    intensityDetail: {
      myAvgIntensity: detailSummary.myAvgIntensity || '',
      platformAvgIntensity: detailSummary.platformAvgIntensity || '',
    },
    hardDetail: {
      trend: detailSummary.hardTrend || '',
    },
  }
}

function buildLocalFallbackPlan(errorMessage = '', lang = 'zh') {
  const activeLang = resolveLang(lang)
  const sourcePlan = activeLang === 'en'
    ? EN_LOCAL_FALLBACK_PLAN
    : (seedPlans[Math.floor(Math.random() * seedPlans.length)] || seedPlans[0])

  return {
    summary: sourcePlan.summary,
    dietFocus: sourcePlan.dietFocus || (activeLang === 'en' ? 'Recovery First' : '恢复优先'),
    dietSuggestions: sourcePlan.dietSuggestions || [],
    exerciseSuggestions: sourcePlan.exerciseSuggestions || [],
    nextVibrationMode: {
      mode: sourcePlan.vibrationSuggestion?.mode || (activeLang === 'en' ? 'Steady Rhythm' : '稳定节奏'),
      desc: sourcePlan.vibrationSuggestion?.desc
        || (sourcePlan.vibrationSuggestion?.freq
          ? `${sourcePlan.vibrationSuggestion.freq}Hz ${activeLang === 'en' ? 'range, progress gradually' : '附近，逐步推进'}`
          : (activeLang === 'en' ? 'Start low to mid frequency and build gradually' : '中低频起步，逐步加速')),
      reason: sourcePlan.vibrationSuggestion?.reason || (activeLang === 'en' ? 'Your current state is better suited to a stable rhythm first' : '当前更适合先稳定节奏与感受'),
    },
    provider: 'fallback',
    fallback: true,
    timestamp: new Date().toISOString(),
    error: errorMessage,
    lang: activeLang,
  }
}

function normalizeServerPlan(serverData = {}, lang = 'zh') {
  const activeLang = resolveLang(serverData.lang || lang)
  const resolvedDietSuggestions = serverData.dietSuggestions || serverData.diet?.tips || []
  const resolvedExerciseSuggestions = serverData.exerciseSuggestions || serverData.exercise?.tips || []
  const resolvedNextVibrationMode = serverData.nextVibrationMode || serverData.vibrationSuggestion || {
    mode: serverData.vibrationMode || (activeLang === 'en' ? 'Steady Rhythm' : '稳定节奏'),
    desc: serverData.vibrationModeDesc || (activeLang === 'en' ? 'Start low to mid frequency and build gradually' : '中低频起步，逐步加速'),
    reason: serverData.vibrationModeReason || (activeLang === 'en' ? 'Your current state is better suited to a stable rhythm first' : '当前更适合先稳定节奏与感受'),
  }

  return {
    summary: serverData.summary || (activeLang === 'en'
      ? 'Based on your current data, keep the rhythm stable and prioritize recovery with light training.'
      : '根据当前数据建议先稳住节奏，优先恢复与轻量训练。'),
    dietFocus: serverData.dietFocus || (activeLang === 'en' ? 'Recovery First' : '恢复优先'),
    dietSuggestions: resolvedDietSuggestions,
    exerciseSuggestions: resolvedExerciseSuggestions,
    nextVibrationMode: resolvedNextVibrationMode,
    provider: serverData.provider || serverData._provider || (serverData.source === 'grok' ? 'grok' : 'fallback'),
    fallback: Boolean(serverData.fallback ?? serverData._fallback ?? serverData.source === 'fallback'),
    timestamp: serverData.timestamp || new Date().toISOString(),
    error: serverData.error || serverData.aiError || '',
    lang: activeLang,
  }
}

/**
 * 生成健康训练计划
 *
 * @param {object} payload - 生成计划所需的上下文数据
 *   {
 *     todayStats: object,        // 今日统计
 *     weeklyTrend: array,        // 近 7 天趋势
 *     detailSummary: object,     // 详细摘要
 *   }
 * @returns {Promise<object>}
 *   { summary, dietSuggestions, exerciseSuggestions, nextVibrationMode, provider, fallback, timestamp }
 */
export async function fetchHealthPlan(payload = {}) {
  const activeLang = resolveLang(payload.lang)

  try {
    const response = await post('/api/health/plan', buildCompatibleHealthPayload(payload), {
      ...withRetry(2),
      timeout: 15000,
    })

    const responseData = response?.data || response

    if (!response?.ok || !responseData) {
      throw new Error(response?.error?.message || (activeLang === 'en' ? 'Invalid health plan response' : '健康计划接口返回无效'))
    }

    const normalized = normalizeServerPlan(responseData, activeLang)
    console.log('💪 [Health API] 使用后端结果', {
      provider: normalized.provider,
      fallback: normalized.fallback,
    })
    return normalized
  } catch (error) {
    const fallbackResult = buildLocalFallbackPlan(error.message, activeLang)
    console.warn('❌ fetchHealthPlan 失败，使用本地 fallback:', {
      reason: error.message,
      provider: fallbackResult.provider,
      fallback: fallbackResult.fallback,
    })
    return fallbackResult
  }
}

export default {
  fetchHealthPlan,
}
