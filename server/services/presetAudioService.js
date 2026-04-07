import { existsSync } from 'fs'
import { mkdir, readdir, readFile, stat, writeFile } from 'fs/promises'
import { join } from 'path'
import { textToSpeech } from '../providers/fishAudioProvider.js'
import { getPresetVoiceScene } from '../data/presetVoiceScenes.js'
import { generateScriptText } from './scriptService.js'

const AUDIO_DIR = process.env.PRESET_AUDIO_DIR
  || process.env.AUDIO_STORAGE_DIR
  || (process.platform === 'win32'
    ? join(process.cwd(), 'server', 'storage', 'audio', 'presets')
    : '/data/audio/presets')

const SCRIPT_CACHE_VERSION = 2

let poolPromise = null
let schemaReadyPromise = null

function getAudioKey(presetId, lang = 'zh') {
  return lang === 'en' ? `${presetId}_en` : presetId
}

function getStreamUrl(presetId, lang = 'zh', version = null) {
  const params = new URLSearchParams()
  if (lang === 'en') params.set('lang', 'en')
  if (version) params.set('v', String(version))
  const query = params.toString()
  return `/api/scripts/preset-audio/${encodeURIComponent(presetId)}/stream${query ? `?${query}` : ''}`
}

function getVoiceText(scene, lang = 'zh') {
  return lang === 'en' ? scene.textEn : scene.text
}

function getVoiceRole(scene, lang = 'zh') {
  return lang === 'en' ? scene.roleEn : scene.role
}

function getVoiceTitle(scene, lang = 'zh') {
  return lang === 'en' ? scene.titleEn : scene.title
}

async function getPool() {
  if (!process.env.DATABASE_URL) return null
  if (!poolPromise) {
    poolPromise = import('pg')
      .then(({ Pool }) => new Pool({ connectionString: process.env.DATABASE_URL }))
      .catch((err) => {
        console.warn(`⚠️ [PresetAudio] PostgreSQL 不可用，降级为 Volume 文件缓存: ${err.message}`)
        return null
      })
  }
  return poolPromise
}

async function ensureSchema(pool) {
  if (!pool) return
  if (!schemaReadyPromise) {
    schemaReadyPromise = pool.query(`
      CREATE TABLE IF NOT EXISTS preset_audio_packages (
        audio_key TEXT PRIMARY KEY,
        preset_id TEXT NOT NULL,
        lang TEXT NOT NULL DEFAULT 'zh',
        file_name TEXT NOT NULL,
        version INTEGER NOT NULL DEFAULT 1,
        script_json JSONB,
        enabled BOOLEAN NOT NULL DEFAULT TRUE,
        generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `).then(() => pool.query(`
      ALTER TABLE preset_audio_packages
      ADD COLUMN IF NOT EXISTS script_json JSONB
    `)).catch((err) => {
      schemaReadyPromise = null
      throw err
    })
  }
  await schemaReadyPromise
}

async function getAudioRecord(audioKey) {
  try {
    const pool = await getPool()
    if (!pool) return null
    await ensureSchema(pool)
    const result = await pool.query(
      'SELECT * FROM preset_audio_packages WHERE audio_key = $1 AND enabled = TRUE',
      [audioKey]
    )
    return result.rows[0] || null
  } catch (err) {
    console.warn(`⚠️ [PresetAudio] 读取 PostgreSQL 记录失败，改用 Volume 扫描: ${err.message}`)
    return null
  }
}

async function saveAudioRecord({ audioKey, presetId, lang, fileName, version, scriptJson }) {
  try {
    const pool = await getPool()
    if (!pool) return
    await ensureSchema(pool)
    await pool.query(
      `
        INSERT INTO preset_audio_packages (audio_key, preset_id, lang, file_name, version, script_json, enabled, generated_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, TRUE, NOW(), NOW())
        ON CONFLICT (audio_key)
        DO UPDATE SET
          file_name = EXCLUDED.file_name,
          version = EXCLUDED.version,
          script_json = EXCLUDED.script_json,
          enabled = TRUE,
          updated_at = NOW()
      `,
      [audioKey, presetId, lang, fileName, version, JSON.stringify(scriptJson)]
    )
  } catch (err) {
    console.warn(`⚠️ [PresetAudio] 写入 PostgreSQL 记录失败，音频文件已保存在 Volume: ${err.message}`)
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

function versionFromFileName(fileName) {
  const match = fileName.match(/_v(\d+)\.mp3$/)
  return match ? Number(match[1]) : 0
}

function getMetaFileName(fileName) {
  return fileName.replace(/\.mp3$/, '.json')
}

async function readAudioMetadata(fileName) {
  try {
    const body = await readFile(join(AUDIO_DIR, getMetaFileName(fileName)), 'utf8')
    return JSON.parse(body)
  } catch {
    return null
  }
}

function getStoredCharacter(metadata) {
  if (!metadata) return null
  if (metadata.cacheVersion !== SCRIPT_CACHE_VERSION) return null
  if (metadata.character) return metadata.character
  if (metadata.name || metadata.openingLine || metadata.personalityTag || metadata.gradient) {
    return metadata
  }
  return null
}

async function findLatestAudioFile(audioKey) {
  if (!existsSync(AUDIO_DIR)) return null
  const files = await readdir(AUDIO_DIR).catch(() => [])
  const matches = files
    .filter((fileName) => fileName.startsWith(`${audioKey}_v`) && fileName.endsWith('.mp3'))
    .map((fileName) => ({
      fileName,
      version: versionFromFileName(fileName),
      filePath: join(AUDIO_DIR, fileName),
    }))
    .sort((a, b) => b.version - a.version)

  for (const match of matches) {
    if (await fileExists(match.filePath)) {
      const metadata = await readAudioMetadata(match.fileName)
      return { ...match, scriptJson: metadata }
    }
  }
  return null
}

async function getCurrentAudioFile(audioKey) {
  const record = await getAudioRecord(audioKey)
  if (record?.file_name) {
    const filePath = join(AUDIO_DIR, record.file_name)
    if (await fileExists(filePath)) {
      return {
        fileName: record.file_name,
        version: Number(record.version) || versionFromFileName(record.file_name),
        filePath,
        scriptJson: record.script_json || await readAudioMetadata(record.file_name),
      }
    }
  }
  return findLatestAudioFile(audioKey)
}

async function getNextVersion(audioKey) {
  const current = await getCurrentAudioFile(audioKey)
  return (current?.version || 0) + 1
}

function buildPresetScript(scene, lang, cached, character = null, version = null) {
  const text = getVoiceText(scene, lang)
  const role = getVoiceRole(scene, lang)
  const title = getVoiceTitle(scene, lang)
  const generated = character || {}
  const generatedName = generated.name || title
  const generatedPersonalityTag = generated.personalityTag || role
  const generatedOpeningLine = generated.openingLine || text

  return {
    id: `preset-${scene.id}`,
    presetId: scene.id,
    charId: scene.charId,
    sceneId: scene.sceneId,
    cover: scene.coverEmoji,
    coverEmoji: scene.coverEmoji,
    name: generatedName,
    nameEn: generated.name || scene.titleEn,
    title: generatedName,
    titleEn: generated.name || scene.titleEn,
    tag: lang === 'en' ? 'Preset Voice' : '固定语音',
    tagEn: 'Preset Voice',
    personalityTag: generatedPersonalityTag,
    personalityTagEn: generated.personalityTag || scene.roleEn,
    openingLine: generatedOpeningLine,
    openingLineEn: generated.openingLine || scene.textEn,
    downloads: lang === 'en' ? 'Ready' : '已缓存',
    downloadsEn: 'Ready',
    rating: null,
    gradient: generated.gradient || scene.gradient,
    isAIGenerated: true,
    isPresetVoice: true,
    isFree: true,
    audioUrl: getStreamUrl(scene.id, lang, version),
    audioCached: cached,
    audioVersion: version,
    freeCoverImage: scene.freeCoverImage || '',
    vipCoverImage: scene.vipCoverImage || '',
  }
}

export async function preparePresetVoiceAudio(presetId, options = {}) {
  const scene = getPresetVoiceScene(presetId)
  if (!scene) {
    const err = new Error('预设场景不存在')
    err.statusCode = 404
    throw err
  }

  const lang = options.lang === 'en' ? 'en' : 'zh'
  const audioKey = getAudioKey(scene.id, lang)

  if (!options.force) {
    const current = await getCurrentAudioFile(audioKey)
    const storedCharacter = getStoredCharacter(current?.scriptJson)
    if (current && storedCharacter) {
      return {
        ok: true,
        cached: true,
        script: buildPresetScript(scene, lang, true, storedCharacter, current.version),
      }
    }
  }

  await mkdir(AUDIO_DIR, { recursive: true })
  const version = await getNextVersion(audioKey)
  const fileName = `${audioKey}_v${version}.mp3`
  const filePath = join(AUDIO_DIR, fileName)
  const metadataPath = join(AUDIO_DIR, getMetaFileName(fileName))

  const sourcePrompt = getVoiceText(scene, lang)
  const { character } = await generateScriptText(sourcePrompt)
  const audioBase64 = await textToSpeech(character.openingLine)
  const scriptJson = {
    cacheVersion: SCRIPT_CACHE_VERSION,
    presetId: scene.id,
    lang,
    sourcePrompt,
    character,
    generatedAt: new Date().toISOString(),
  }
  await writeFile(filePath, Buffer.from(audioBase64, 'base64'))
  await writeFile(metadataPath, JSON.stringify(scriptJson, null, 2), 'utf8')
  await saveAudioRecord({ audioKey, presetId: scene.id, lang, fileName, version, scriptJson })

  return { ok: true, cached: false, script: buildPresetScript(scene, lang, false, character, version) }
}

export async function getPresetVoiceAudioStream(presetId, options = {}) {
  const scene = getPresetVoiceScene(presetId)
  if (!scene) {
    const err = new Error('预设场景不存在')
    err.statusCode = 404
    throw err
  }

  const lang = options.lang === 'en' ? 'en' : 'zh'
  const audioKey = getAudioKey(scene.id, lang)
  const current = await getCurrentAudioFile(audioKey)
  if (!current) {
    const err = new Error('该预设语音尚未生成')
    err.statusCode = 404
    throw err
  }

  const info = await stat(current.filePath)
  return {
    filePath: current.filePath,
    size: info.size,
  }
}
