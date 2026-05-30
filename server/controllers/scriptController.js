/**
 * server/controllers/scriptController.js — 脚本生成控制器
 */

import { createReadStream } from 'fs'
import { generateScript, generateScriptText, generateScriptAudio } from '../services/scriptService.js'
import { getPresetVoiceAudioStream, preparePresetVoiceAudio } from '../services/presetAudioService.js'

function sendAudioFile(req, res, file) {
  res.setHeader('Content-Type', 'audio/mpeg')
  res.setHeader('Accept-Ranges', 'bytes')

  const range = req.headers.range
  if (!range) {
    res.setHeader('Content-Length', file.size)
    createReadStream(file.filePath).pipe(res)
    return
  }

  const match = String(range).match(/bytes=(\d*)-(\d*)/)
  if (!match) {
    res.setHeader('Content-Length', file.size)
    createReadStream(file.filePath).pipe(res)
    return
  }

  const start = match[1] ? Number(match[1]) : 0
  const end = match[2] ? Number(match[2]) : file.size - 1
  if (Number.isNaN(start) || Number.isNaN(end) || start > end || start >= file.size) {
    res.status(416).setHeader('Content-Range', `bytes */${file.size}`).end()
    return
  }

  const safeEnd = Math.min(end, file.size - 1)
  res.status(206)
  res.setHeader('Content-Length', safeEnd - start + 1)
  res.setHeader('Content-Range', `bytes ${start}-${safeEnd}/${file.size}`)
  createReadStream(file.filePath, { start, end: safeEnd }).pipe(res)
}

export async function generateTextHandler(req, res, next) {
  try {
    const prompt = String(req.body?.prompt || '').trim()
    if (!prompt) return res.status(400).json({ error: '请输入描述' })
    if (prompt.length > 500) return res.status(400).json({ error: '描述太长，请控制在 500 字以内' })
    const apiKeyOverride = String(req.headers['x-grok-api-key'] || '').trim()
    const result = await generateScriptText(prompt, apiKeyOverride)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function generateAudioHandler(req, res, next) {
  try {
    const openingLine = String(req.body?.openingLine || '').trim()
    if (!openingLine) return res.status(400).json({ error: '开场白不能为空' })
    const result = await generateScriptAudio(openingLine)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function preparePresetAudioHandler(req, res, next) {
  try {
    const presetId = String(req.body?.presetId || '').trim()
    if (!presetId) return res.status(400).json({ error: '预设场景不能为空' })
    const result = await preparePresetVoiceAudio(presetId, {
      lang: String(req.body?.lang || 'zh').trim(),
      force: Boolean(req.body?.force),
    })
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function streamPresetAudioHandler(req, res, next) {
  try {
    const file = await getPresetVoiceAudioStream(req.params.presetId, {
      lang: String(req.query?.lang || 'zh').trim(),
    })
    sendAudioFile(req, res, file)
  } catch (err) {
    next(err)
  }
}

export async function generateScriptHandler(req, res, next) {
  try {
    const prompt = String(req.body?.prompt || '').trim()

    if (!prompt) {
      return res.status(400).json({ error: '请输入描述' })
    }
    if (prompt.length > 500) {
      return res.status(400).json({ error: '描述太长，请控制在 500 字以内' })
    }

    const apiKeyOverride = String(req.headers['x-grok-api-key'] || '').trim()
    const result = await generateScript(prompt, apiKeyOverride)

    res.json(result)
  } catch (err) {
    next(err)
  }
}
