/**
 * usePlanPool.js — 训练计划池 Hook
 *
 * 职责：
 *   • 加载 AI 生成的训练计划
 *   • 保持思考态动画
 *   • 仅消费统一结构的真实 API / fallback 结果
 */
import { useState, useRef, useCallback, useEffect } from 'react'
import { fetchHealthPlan } from '../api/healthPlan'

const SWITCH_DURATION = 1700 // 思考动画时长
const HEALTH_PLAN_SESSION_KEY = 'health_plan_session_state'

function resolveLang(lang) {
  return lang === 'en' ? 'en' : 'zh'
}

function getStoredPlanLang(plan) {
  return plan?.lang === 'en' ? 'en' : 'zh'
}

function getPlanSessionKey(lang) {
  return `${HEALTH_PLAN_SESSION_KEY}_${resolveLang(lang)}`
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function readStoredPlanState(lang) {
  if (typeof window === 'undefined') return null

  try {
    const activeLang = resolveLang(lang)
    const raw = window.sessionStorage.getItem(getPlanSessionKey(activeLang))
      || (activeLang === 'zh' ? window.sessionStorage.getItem(HEALTH_PLAN_SESSION_KEY) : null)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    return parsed
  } catch {
    return null
  }
}

function writeStoredPlanState(state, lang) {
  if (typeof window === 'undefined') return

  try {
    window.sessionStorage.setItem(getPlanSessionKey(lang), JSON.stringify(state))
  } catch {
    // ignore storage failures
  }
}

export function usePlanPool(buildPayloadFn, lang = 'zh') {
  const activeLang = resolveLang(lang)
  const [currentPlan, setCurrentPlan] = useState(() => readStoredPlanState(activeLang)?.currentPlan || null)
  const [planVisible, setPlanVisible] = useState(() => Boolean(readStoredPlanState(activeLang)?.planVisible && readStoredPlanState(activeLang)?.currentPlan))
  const [isSwitching, setIsSwitching] = useState(false)
  const [isFallbackMode, setIsFallbackMode] = useState(() => Boolean(readStoredPlanState(activeLang)?.isFallbackMode))
  const [isCurrentPlanUpgrading, setIsCurrentPlanUpgrading] = useState(false)
  const [lastPlanMeta, setLastPlanMeta] = useState(() => readStoredPlanState(activeLang)?.lastPlanMeta || null)

  const requestIdRef = useRef(0)

  useEffect(() => {
    const stored = readStoredPlanState(activeLang)
    requestIdRef.current += 1
    setCurrentPlan(stored?.currentPlan || null)
    setPlanVisible(Boolean(stored?.planVisible && stored?.currentPlan))
    setIsFallbackMode(Boolean(stored?.isFallbackMode))
    setLastPlanMeta(stored?.lastPlanMeta || null)
    setIsSwitching(false)
    setIsCurrentPlanUpgrading(false)
  }, [activeLang])

  useEffect(() => {
    if (currentPlan && getStoredPlanLang(currentPlan) !== activeLang) return

    writeStoredPlanState({
      currentPlan,
      planVisible,
      isFallbackMode,
      lastPlanMeta,
    }, activeLang)
  }, [currentPlan, planVisible, isFallbackMode, lastPlanMeta, activeLang])

  const handleGeneratePlan = useCallback(async () => {
    if (isSwitching) return

    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId

    setIsSwitching(true)
    setIsCurrentPlanUpgrading(true)
    setPlanVisible(false)
    setLastPlanMeta(null)

    try {
      const payload = {
        ...(buildPayloadFn ? buildPayloadFn(activeLang) : {}),
        lang: activeLang,
      }
      const [response] = await Promise.all([
        fetchHealthPlan(payload),
        wait(SWITCH_DURATION),
      ])

      if (requestId !== requestIdRef.current) return

      if (response?.summary) {
        const localizedResponse = { ...response, lang: activeLang }
        setCurrentPlan(localizedResponse)
        setPlanVisible(true)
        setIsFallbackMode(Boolean(response.fallback))
        setLastPlanMeta(localizedResponse)
      }
    } catch (error) {
      if (requestId === requestIdRef.current) {
        setIsFallbackMode(true)
        setLastPlanMeta({
          provider: 'fallback',
          fallback: true,
          error: error.message,
        })
      }
      console.error('Failed to generate health plan:', error)
    } finally {
      if (requestId === requestIdRef.current) {
        setIsSwitching(false)
        setIsCurrentPlanUpgrading(false)
      }
    }
  }, [buildPayloadFn, isSwitching, activeLang])

  return {
    currentPlan,
    planVisible,
    isSwitching,
    isFallbackMode,
    isCurrentPlanUpgrading,
    lastPlanMeta,
    handleGeneratePlan,
  }
}
