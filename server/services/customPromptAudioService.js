import { createHash } from 'crypto'
import { existsSync } from 'fs'
import { mkdir, readFile, stat, writeFile } from 'fs/promises'
import { join } from 'path'
import { textToSpeech } from '../providers/fishAudioProvider.js'
import { generateScriptText } from './scriptService.js'

const CUSTOM_AUDIO_DIR = process.env.CUSTOM_AUDIO_DIR
  || (process.env.AUDIO_STORAGE_DIR && join(process.env.AUDIO_STORAGE_DIR, 'custom-prompts'))
  || (process.platform === 'win32'
    ? join(process.cwd(), 'server', 'storage', 'audio', 'custom-prompts')
    : '/data/audio/custom-prompts')

const CACHE_VERSION = 1

function normalizePrompt(prompt) {
  return String(prompt || '').trim().replace(/\s+/g, ' ')
}

function getPromptHash(prompt, lang = 'zh') {
  return createHash('sha256')
    .update(`${lang}:${normalizePrompt(prompt)}`)
    .digest('hex')
    .slice(0, 16)
}

function getFilePaths(promptHash) {
  return {
    audioFileName: `${promptHash}.mp3`,
    metaFileName: `${promptHash}.json`,
    audioPath: join(CUSTOM_AUDIO_DIR, `${promptHash}.mp3`),
    metaPath: join(CUSTOM_AUDIO_DIR, `${promptHash}.json`),
  }
}

async function fileExists(filePath) {
  try {
    const info = await stat(filePath)
    return info.isFile()
  } catch {
    return false
  }
}

function getStreamUrl(promptHash, lang = 'zh') {
  const params = new URLSearchParams()
  if (lang === 'en') params.set('lang', 'en')
  return `/api/scripts/custom-prompt-audio/${encodeURIComponent(promptHash)}/stream${params.toString() ? `?${params}` : ''}`
}

function buildCustomScript({ promptHash, prompt, lang, character, cached }) {
  return {
    id: `custom-prompt-${promptHash}`,
    contentId: `custom-prompt-${promptHash}`,
    promptHash,
    sourcePrompt: prompt,
    source: cached ? 'custom-cache' : 'custom-generated',
    cached,
    lang,
    charId: 'witch',
    sceneId: 'balcony',
    cover: '🧙‍♀️',
    coverEmoji: '🧙‍♀️',
    name: character.name,
    nameEn: character.name,
    title: character.name,
    titleEn: character.name,
    tag: cached ? '已生成' : 'AI定制',
    tagEn: cached ? 'Generated' : 'AI Custom',
    personalityTag: character.personalityTag,
    personalityTagEn: character.personalityTag,
    openingLine: character.openingLine,
    openingLineEn: character.openingLine,
    downloads: cached ? '内容池' : '刚刚生成',
    downloadsEn: cached ? 'Saved' : 'New',
    rating: null,
    gradient: character.gradient || 'from-[#1a0a30] to-[#3a1060]',
    isAIGenerated: true,
    isCustomPrompt: true,
    isFree: true,
    audioUrl: getStreamUrl(promptHash, lang),
    audioCached: cached,
    freeCoverImage: '/images/covers/witch.jpg',
    vipCoverImage: '/images/covers/knight.jpg',
  }
}

async function readCachedScript(promptHash, prompt, lang) {
  if (!existsSync(CUSTOM_AUDIO_DIR)) return null
  const paths = getFilePaths(promptHash)
  if (!await fileExists(paths.audioPath)) return null

  try {
    const metadata = JSON.parse(await readFile(paths.metaPath, 'utf8'))
    if (metadata.cacheVersion !== CACHE_VERSION || !metadata.character) return null
    return buildCustomScript({
      promptHash,
      prompt: metadata.sourcePrompt || prompt,
      lang: metadata.lang || lang,
      character: metadata.character,
      cached: true,
    })
  } catch {
    return null
  }
}

export async function prepareCustomPromptAudio(prompt, options = {}) {
  const normalizedPrompt = normalizePrompt(prompt)
  if (!normalizedPrompt) {
    const err = new Error('请输入描述')
    err.statusCode = 400
    throw err
  }
  if (normalizedPrompt.length > 500) {
    const err = new Error('描述太长，请控制在 500 字以内')
    err.statusCode = 400
    throw err
  }

  const lang = options.lang === 'en' ? 'en' : 'zh'
  const promptHash = getPromptHash(normalizedPrompt, lang)

  if (!options.force) {
    const cachedScript = await readCachedScript(promptHash, normalizedPrompt, lang)
    if (cachedScript) {
      return { ok: true, cached: true, script: cachedScript }
    }
  }

  await mkdir(CUSTOM_AUDIO_DIR, { recursive: true })
  const paths = getFilePaths(promptHash)
  const { character } = await generateScriptText(normalizedPrompt, options.apiKeyOverride || '')
  const audioBase64 = await textToSpeech(character.openingLine)
  const metadata = {
    cacheVersion: CACHE_VERSION,
    promptHash,
    lang,
    sourcePrompt: normalizedPrompt,
    character,
    generatedAt: new Date().toISOString(),
  }

  await writeFile(paths.audioPath, Buffer.from(audioBase64, 'base64'))
  await writeFile(paths.metaPath, JSON.stringify(metadata, null, 2), 'utf8')

  return {
    ok: true,
    cached: false,
    script: buildCustomScript({
      promptHash,
      prompt: normalizedPrompt,
      lang,
      character,
      cached: false,
    }),
  }
}

export async function getCustomPromptAudioStream(promptHash) {
  const safeHash = String(promptHash || '').trim()
  if (!/^[a-f0-9]{16}$/.test(safeHash)) {
    const err = new Error('自定义语音不存在')
    err.statusCode = 404
    throw err
  }

  const { audioPath } = getFilePaths(safeHash)
  const info = await stat(audioPath).catch(() => null)
  if (!info?.isFile()) {
    const err = new Error('自定义语音尚未生成')
    err.statusCode = 404
    throw err
  }

  return {
    filePath: audioPath,
    size: info.size,
  }
}
