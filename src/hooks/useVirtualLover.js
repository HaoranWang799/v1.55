import { useCallback, useEffect, useRef, useState } from 'react'
import { clearVirtualLoverMemory, fetchVirtualLoverBatch } from '../api/virtualLover'
import { useApp } from '../context/AppContext'

const POOL_REFILL_THRESHOLD = 3
const FADE_HALF_MS = 60

function useVirtualLover() {
  const { lang } = useApp()
  const activeLang = lang === 'en' ? 'en' : 'zh'
  const poolRef = useRef([])
  const isFetchingRef = useRef(false)
  const switchTimerRef = useRef(null)

  const [text, setText] = useState('')
  const [mood, setMood] = useState('温柔')
  const [fadeIn, setFadeIn] = useState(true)
  const [loading, setLoading] = useState(true)
  const [provider, setProvider] = useState('')
  const [timestamp, setTimestamp] = useState('')

  const applyMessage = useCallback((message) => {
    clearTimeout(switchTimerRef.current)
    setFadeIn(false)
    switchTimerRef.current = setTimeout(() => {
      setText(message?.text || '')
      setMood(message?.mood || '温柔')
      setProvider(message?.provider || '')
      setTimestamp(message?.timestamp || '')
      setFadeIn(true)
    }, FADE_HALF_MS)
  }, [])

  const fetchBatch = useCallback(async () => {
    if (isFetchingRef.current) return []
    isFetchingRef.current = true
    setLoading(true)
    try {
      const items = await fetchVirtualLoverBatch({ lang: activeLang })
      const validItems = Array.isArray(items) ? items.filter((item) => item?.text) : []
      poolRef.current.push(...validItems)
      return validItems
    } finally {
      isFetchingRef.current = false
      setLoading(false)
    }
  }, [activeLang])

  const refreshMessage = useCallback(async () => {
    if (poolRef.current.length === 0) {
      await fetchBatch()
    }

    const next = poolRef.current.shift()
    if (next) {
      applyMessage(next)
      if (poolRef.current.length <= POOL_REFILL_THRESHOLD) fetchBatch()
      return
    }

    applyMessage({ text: '', mood: '温柔', provider: '', timestamp: '' })
  }, [applyMessage, fetchBatch])

  const clearMemory = useCallback(async () => {
    try {
      await clearVirtualLoverMemory()
    } finally {
      clearTimeout(switchTimerRef.current)
      poolRef.current = []
      setText('')
      setMood('温柔')
      setProvider('')
      setTimestamp('')
      setFadeIn(true)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    poolRef.current = []
    refreshMessage()
    return () => clearTimeout(switchTimerRef.current)
  }, [refreshMessage])

  return {
    clearMemory,
    fadeIn,
    fallback: false,
    loading,
    metaText: provider,
    mood,
    provider,
    text,
    timestamp,
    refreshMessage,
  }
}

export { useVirtualLover }
