/**
 * src/api/scripts.js — AI 剧本生成前端 API 封装
 */

import { buildApiUrl } from './baseUrl'

/**
 * 根据用户描述生成角色 + TTS 音频（旧版单一接口，保留兼容）
 */
export async function generateScript(prompt) {
  const url = buildApiUrl('/api/scripts/generate')
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `生成失败 (${res.status})`)
  }
  return res.json()
}

/**
 * Step 1：只调 Grok，返回 { character }
 */
export async function generateScriptText(prompt) {
  const url = buildApiUrl('/api/scripts/generate-text')
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `角色生成失败 (${res.status})`)
  }
  return res.json()
}

/**
 * Step 2：只调 Fish Audio TTS，返回 { audioBase64 }
 */
export async function generateScriptAudio(openingLine) {
  const url = buildApiUrl('/api/scripts/generate-audio')
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ openingLine }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `语音生成失败 (${res.status})`)
  }
  return res.json()
}

/**
 * 预设语音：16 条固定场景共用同一份缓存音频。
 * 首次请求会由后端生成并写入 Railway Volume，之后直接返回已有音频。
 */
export async function preparePresetVoiceAudio(presetId, options = {}) {
  const url = buildApiUrl('/api/scripts/preset-audio')
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      presetId,
      lang: options.lang || 'zh',
      force: Boolean(options.force),
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || err.error || `预设语音准备失败 (${res.status})`)
  }
  return res.json()
}

export async function fetchPresetVoiceAudioPackages(options = {}) {
  const params = new URLSearchParams()
  params.set('lang', options.lang || 'zh')
  const url = buildApiUrl(`/api/scripts/preset-audio?${params.toString()}`)
  const res = await fetch(url)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || err.error || `预设语音列表加载失败 (${res.status})`)
  }
  return res.json()
}
