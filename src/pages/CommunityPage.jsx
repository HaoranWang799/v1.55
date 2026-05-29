/**
 * CommunityPage.jsx — 社区
 *
 * 当前数据策略：
 *   • 体验分享只展示数据库中已启用的预设语音包
 *   • 攻略教程 / 创作展示没有真实数据时显示空状态
 *   • 顶部 Tab 切换（体验分享 / 攻略教程 / 创作展示）
 *   • AI 主动关怀卡片（可删除记忆）
 *
 * TODO: AI 关怀消息接入真实硬件记忆模块（蓝牙数据分析）
 * TODO: 接入真实匿名身份系统与内容加密
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bookmark, Heart, MessageCircle, Pause, Play, PlayCircle, Plus, Send, Sparkles, Trash2, Volume2 } from 'lucide-react'
import { useVirtualLover } from '../hooks/useVirtualLover'
import { useApp } from '../context/AppContext'
import { useL } from '../i18n/useL'
import { fetchPresetVoiceAudioPackages, preparePresetVoiceAudio } from '../api/scripts'

const COMMUNITY_NAME_EN = {
  '小野猫': 'Kitten',
  '硬汉柔情': 'Soft-Hearted Tough Guy',
  '彩虹下的他': 'Under the Rainbow',
  '甜蜜小两口': 'Sweet Couple',
  '夜行狐': 'Night Fox',
  '熊猫不睡觉': 'Sleepless Panda',
  '攻略达人': 'Guide Master',
  '隐藏剧情猎人': 'Hidden Ending Hunter',
  '蝴蝶效应': 'Butterfly Effect',
  '数据控小明': 'Data Ming',
  '创作家Mia': 'Creator Mia',
  '写字的人': 'The Writer',
  '彩虹糖果': 'Rainbow Candy',
  '插画师Leo': 'Illustrator Leo',
}

const COMMUNITY_TEMPLATE_EN = {
  '冷感女上司·深夜版': 'Cold Boss Lady · Late Night',
  '温柔学妹·宿舍私语': 'Sweet Junior · Dorm Whisper',
  '彩虹之约·校园初恋': 'Rainbow Promise · Campus First Love',
  '阳台邂逅·月夜情话': 'Balcony Encounter · Moonlit Confession',
  '阳台·神秘邻居': 'Balcony · Mysterious Neighbor',
  '知性女老师·放学后': 'Intellectual Teacher · After Class',
  '深夜阳台·神秘邻居': 'Late-Night Balcony · Mysterious Neighbor',
  '神秘邻居·月夜偶遇': 'Mysterious Neighbor · Moonlit Encounter',
  '郁金香庭院·雨后': 'Tulip Courtyard · After Rain',
}

const EXPERIENCE_IMAGE_FALLBACKS = {
  1: 'boss',
  2: 'junior',
  3: 'rb1',
  4: 'h3',
  5: 'neighbor',
  6: 'boss',
}

function resolveExperienceImageId(post) {
  if (post.imageId) return post.imageId
  if (post.templateId && !String(post.templateId).startsWith('community-')) {
    return post.templateId
  }
  return EXPERIENCE_IMAGE_FALLBACKS[post.id] || 'boss'
}

const EXPERIENCE_LINES_ZH = {
  1: '别急，先听我说完这一句。',
  2: '把节奏交给我，慢慢来。',
  3: '现在，我们一起同步呼吸。',
  4: '靠近一点，今晚只看着我。',
  5: '风停下来的时候，我会更靠近你。',
  6: '保持这个温度，隐藏台词快来了。',
}

const EXPERIENCE_LINES_EN = {
  1: 'Wait, let me finish this line first.',
  2: 'Follow my rhythm and take it slowly.',
  3: 'Now breathe with me, together.',
  4: 'Come closer and keep your eyes on me.',
  5: 'When the wind settles, I move closer.',
  6: 'Hold this intensity. The hidden line is close.',
}

/** charId → 预设语音场景 ID 映射（取每个角色的第一个匹配场景） */
const CHAR_TO_PRESET_MAP = {
  'boss': 'hot_01',
  'junior': 'hot_02',
  'neighbor': 'hot_03',
  'teacher': 'fantasy_03',
  'witch': 'fantasy_02',
  'hot_01': 'hot_01',
  'office_03': 'office_03',
  'campus_01': 'campus_01',
  'fantasy_02': 'fantasy_02',
}

function formatPackageTime(value) {
  if (!value) return '已缓存'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '已缓存'
  return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
}

function presetPackageToPost(item) {
  const script = item.script || {}
  const imageId = script.charId || script.presetId || item.presetId
  const title = script.title || item.presetId
  const version = Number(item.version || script.audioVersion || 1)

  return {
    id: `preset-audio-${item.audioKey || item.presetId}`,
    type: 'preset-audio',
    templateId: item.presetId,
    templateName: title,
    imageId,
    avatar: script.coverEmoji || script.cover || '🎧',
    name: title,
    time: formatPackageTime(item.updatedAt),
    gender: item.lang === 'en' ? 'EN' : 'ZH',
    content: script.openingLine || script.personalityTag || title,
    previewLine: script.openingLine || title,
    previewLineEn: script.openingLineEn || script.titleEn || title,
    imgColor: script.gradient || 'from-[#1a1028] to-[#251840]',
    imgEmoji: script.coverEmoji || '🎧',
    likes: 0,
    comments: 0,
    bookmarks: 0,
    tags: [`#${item.lang || 'zh'}`, `#v${version}`, '#预设语音'],
    topComments: [],
    audioUrl: script.audioUrl,
    audioVersion: version,
  }
}

/**
 * 使用预设语音音频 — 为体验分享帖加载真实 TTS 音频
 * @param {string|null} templateId 帖子的 templateId / charId
 * @returns {{ audioUrl: string|null, loading: boolean, error: string|null, openingLine: string, characterName: string }}
 */
function useExperienceAudio(templateId, existingAudioUrl = '') {
  const presetId = templateId ? CHAR_TO_PRESET_MAP[templateId] : null
  const [audioUrl, setAudioUrl] = useState(existingAudioUrl || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [openingLine, setOpeningLine] = useState('')
  const [characterName, setCharacterName] = useState('')
  const mountedRef = useRef(true)
  const fetchedRef = useRef(false)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    if (existingAudioUrl) {
      setAudioUrl(existingAudioUrl)
      setLoading(false)
      setError(null)
      return
    }
    if (!presetId || fetchedRef.current) return
    fetchedRef.current = true
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const result = await preparePresetVoiceAudio(presetId)
        if (cancelled || !mountedRef.current) return
        if (result?.script?.audioUrl) {
          setAudioUrl(result.script.audioUrl)
          setOpeningLine(result.script.openingLine || '')
          setCharacterName(result.script.name || '')
        }
      } catch (err) {
        if (cancelled || !mountedRef.current) return
        console.warn(`预设音频加载失败 [${presetId}]:`, err.message)
        setError(err.message)
      } finally {
        if (!cancelled && mountedRef.current) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [presetId, existingAudioUrl])

  return { audioUrl, loading, error, openingLine, characterName, hasPreset: Boolean(presetId) }
}

function usePresetAudioFeed(lang = 'zh') {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchPresetVoiceAudioPackages({ lang })
      const packages = Array.isArray(result?.packages) ? result.packages : []
      setPosts(packages.map(presetPackageToPost))
    } catch (err) {
      setError(err.message || '预设语音加载失败')
      setPosts([])
    } finally {
      setLoading(false)
    }
  }, [lang])

  useEffect(() => {
    load()
  }, [load])

  return { posts, loading, error, refresh: load }
}

// ═══════════════════════════════════════════════════════════
//  子组件
// ═══════════════════════════════════════════════════════════

/**
 * 单条热门评论
 * 新增 likes 数显示
 */
function TopComment({ comment }) {
  const L = useL()
  const [liked, setLiked] = useState(false)
  const displayLikes = liked ? comment.likes + 1 : comment.likes
  const displayName = L(comment.name, COMMUNITY_NAME_EN[comment.name] || comment.name)
  return (
    <div className="flex items-start gap-2 pt-2 border-t border-[rgba(255,255,255,0.04)]">
      <span className="text-sm mt-0.5 flex-shrink-0">{comment.avatar}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-[rgba(245,240,242,0.5)] leading-relaxed">
          <span className="text-[rgba(245,240,242,0.65)] font-medium">{displayName}{L('：', ': ')}</span>
          {comment.text}
        </p>
      </div>
      {/* 评论点赞 */}
      <button
        onClick={() => setLiked((v) => !v)}
        className="flex-shrink-0 flex items-center gap-1 transition-all active:scale-90 ml-1"
      >
        <Heart
          size={11}
          className={`transition-colors ${liked ? 'fill-[#FF9ACB] text-[#FF9ACB]' : 'text-[rgba(245,240,242,0.3)]'}`}
        />
        <span className={`text-[9px] tabular-nums ${liked ? 'text-[#FF9ACB]' : 'text-[rgba(245,240,242,0.3)]'}`}>
          {displayLikes}
        </span>
      </button>
    </div>
  )
}

/** 性别/视角角标 */
function GenderBadge({ gender }) {
  const L = useL()
  if (!gender) return null
  const GENDER_EN = { '女生': 'Female', '男生': 'Male', 'LGBT': 'LGBT', '情侣': 'Couple', '中性': 'Neutral' }
  const styles = {
    '女生':  'bg-[rgba(255,154,203,0.15)] text-[#FF9ACB]',
    '男生':  'bg-[rgba(100,180,255,0.15)] text-[#64b4ff]',
    'LGBT':  'bg-[rgba(179,128,255,0.15)] text-[#B380FF]',
    '情侣':  'bg-[rgba(255,200,100,0.15)] text-[#ffc864]',
    '中性':  'bg-[rgba(255,255,255,0.08)] text-[rgba(245,240,242,0.5)]',
  }
  return (
    <span className={`text-[8px] rounded-full px-1.5 py-0.5 font-medium ${styles[gender] ?? styles['中性']}`}>
      {L(gender, GENDER_EN[gender] || gender)}
    </span>
  )
}

/** 帖子卡片 */
function PostCard({ post, likeState, onLike }) {
  const L = useL()
  const { liked, count } = likeState
  const [imgSrc, setImgSrc] = useState(`/images/posts/${post.templateId}.jpg`)
  const en = null
  const tags = Array.isArray(post.tags) ? post.tags : []
  const displayTags = en?.tags ? tags.map((t, i) => L(t, en.tags[i] || t)) : tags
  const topComments = Array.isArray(post.topComments) ? post.topComments : []
  const displayComments = en?.comments ? topComments.map((c, i) => ({ ...c, text: L(c.text, en.comments[i] || c.text) })) : topComments
  const comments = Number(post.comments || 0)
  const bookmarks = Number(post.bookmarks || 0)
  const imgColor = post.imgColor || 'from-[#1a1028] to-[#251840]'
  const imgEmoji = post.imgEmoji || post.avatar || '✨'
  const displayName = L(post.name, COMMUNITY_NAME_EN[post.name] || post.name)
  const displayTemplateName = L(post.templateName, COMMUNITY_TEMPLATE_EN[post.templateName] || post.templateName)

  return (
    <div className="rounded-2xl p-4 card-glow bg-[rgba(30,20,25,0.6)] space-y-3">
      {/* 头部：头像 + 昵称 + 时间 + 视角角标 */}
      <div className="flex items-center gap-2.5">
        <span className="text-2xl leading-none">{post.avatar}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-semibold text-[rgba(245,240,242,0.9)] truncate">{displayName}</p>
            <GenderBadge gender={post.gender} />
          </div>
          <p className="text-[10px] text-[rgba(245,240,242,0.4)]">{L(post.time, en?.time || post.time)}</p>
        </div>
      </div>

      {/* 正文 */}
      <p className="text-[12px] text-[rgba(245,240,242,0.75)] leading-relaxed">{L(post.content, en?.content || post.content)}</p>

      {/* 图片区（jpg → png → emoji+渐变 链式回退） */}
      <div className={`relative h-48 rounded-xl overflow-hidden bg-gradient-to-br ${imgColor} flex items-center justify-center`}>
        {imgSrc && (
          <img
            src={imgSrc}
            alt=""
            onError={() => {
              if (imgSrc.endsWith('.jpg')) setImgSrc(`/images/posts/${post.templateId}.png`)
              else setImgSrc(null)
            }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        {!imgSrc && (
          <span className="text-3xl select-none opacity-40">{imgEmoji}</span>
        )}
      </div>

      {/* 标签 */}
      <div className="flex gap-1.5 flex-wrap">
        {displayTags.map((tag) => (
          <span
            key={tag}
            className="text-[10px] bg-[rgba(179,128,255,0.12)] text-[rgba(179,128,255,0.7)] rounded-full px-2 py-0.5"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* 试用模板按钮 */}
      {post.templateName && (
        <button
          onClick={() => alert(L('试用模板：', 'Try template: ') + displayTemplateName)}
          className="inline-flex items-center gap-1 text-xs bg-white/10 px-3 py-1 rounded-full hover:bg-white/20 transition mt-2"
        >
          🔗 {L('试用同款：', 'Try: ')}{displayTemplateName}
        </button>
      )}

      {/* 互动区 */}
      <div className="flex items-center gap-4 pt-1">
        {/* 点赞 */}
        <button
          onClick={onLike}
          className="flex items-center gap-1.5 transition-all active:scale-90"
        >
          <Heart
            size={14}
            className={`transition-colors ${liked ? 'fill-[#FF9ACB] text-[#FF9ACB]' : 'text-[rgba(245,240,242,0.4)]'}`}
          />
          <span className={`text-[11px] tabular-nums ${liked ? 'text-[#FF9ACB]' : 'text-[rgba(245,240,242,0.45)]'}`}>
            {count.toLocaleString()}
          </span>
        </button>
        {/* 评论 */}
        <button
          className="flex items-center gap-1.5"
          onClick={() => alert(L('💬 评论功能即将开放', '💬 Comments coming soon'))}
        >
          <MessageCircle size={14} className="text-[rgba(245,240,242,0.4)]" />
          <span className="text-[11px] text-[rgba(245,240,242,0.45)]">{comments}</span>
        </button>
        {/* 收藏 */}
        <button
          className="flex items-center gap-1.5"
          onClick={() => alert(L('🔖 已收藏（演示）', '🔖 Saved (demo)'))}
        >
          <Bookmark size={14} className="text-[rgba(245,240,242,0.4)]" />
          <span className="text-[11px] text-[rgba(245,240,242,0.45)]">{bookmarks}</span>
        </button>
      </div>

      {/* 热门评论（带点赞数） */}
      {topComments.length > 0 && (
        <div className="space-y-1.5">
          {displayComments.map((c, i) => (
            <TopComment key={i} comment={c} />
          ))}
        </div>
      )}
    </div>
  )
}

function ReelAction({ icon: Icon, label, active = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1 text-white/80 transition-all active:scale-90"
    >
      <span className={`flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-md ${
        active
          ? 'border-[#FF9ACB]/55 bg-[#FF4FA3]/35 text-[#FFB8D7] shadow-[0_0_18px_rgba(255,79,163,0.35)]'
          : 'border-white/15 bg-black/35 text-white hover:bg-white/15'
      }`}>
        <Icon size={21} fill={active ? 'currentColor' : 'none'} strokeWidth={2.1} />
      </span>
      <span className="max-w-[54px] truncate text-[10px] font-medium text-white/70">{label}</span>
    </button>
  )
}

function formatAudioTime(seconds) {
  if (!seconds || !isFinite(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

function ReelSlide({ post, likeState, onLike, onTryTemplate, onComment, onSave }) {
  const L = useL()
  const { liked, count } = likeState
  const [saved, setSaved] = useState(false)
  const isPresetAudioCard = post.type === 'preset-audio'
  const imageId = resolveExperienceImageId(post)
  const [imgSrc, setImgSrc] = useState(`/images/posts/${imageId}.jpg`)
  const en = null
  const tags = Array.isArray(post.tags) ? post.tags : []
  const displayTags = en?.tags ? tags.map((t, i) => L(t, en.tags[i] || t)) : tags
  const imgColor = post.imgColor || 'from-[#1a1028] to-[#251840]'
  const imgEmoji = post.imgEmoji || post.avatar || '✨'
  const displayName = L(post.name, COMMUNITY_NAME_EN[post.name] || post.name)
  const displayTemplateName = L(post.templateName, COMMUNITY_TEMPLATE_EN[post.templateName] || post.templateName)
  const content = L(post.content, en?.content || post.content)
  const comments = Number(post.comments || 0)

  // ── 预设语音音频 ──────────────────────────────────────────
  const { audioUrl, loading: audioLoading, error: audioError, openingLine, hasPreset } = useExperienceAudio(post.templateId, post.audioUrl)

  // ── 音频播放状态 ──────────────────────────────────────────
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioCurrent, setAudioCurrent] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const [audioLoaded, setAudioLoaded] = useState(false)
  const progressBarRef = useRef(null)

  // 切换 posts 时重置
  useEffect(() => {
    setIsPlaying(false)
    setAudioCurrent(0)
    setAudioDuration(0)
    setAudioLoaded(false)
  }, [post.id])

  const handlePlayPause = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !audioLoaded) return
    if (audio.paused) {
      audio.play().catch(() => {})
    } else {
      audio.pause()
    }
  }, [audioLoaded])

  const handleSeek = useCallback((event) => {
    const audio = audioRef.current
    const bar = progressBarRef.current
    if (!audio || !audioLoaded || !bar) return
    const rect = bar.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width))
    audio.currentTime = ratio * audio.duration
  }, [audioLoaded])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTimeUpdate = () => setAudioCurrent(audio.currentTime)
    const onDuration = () => { if (audio.duration && isFinite(audio.duration)) { setAudioDuration(audio.duration); setAudioLoaded(true) } }
    const onEnded = () => setIsPlaying(false)
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onLoaded = () => { if (audio.duration && isFinite(audio.duration)) { setAudioDuration(audio.duration); setAudioLoaded(true) } }

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('durationchange', onDuration)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('loadedmetadata', onLoaded)
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('durationchange', onDuration)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('loadedmetadata', onLoaded)
    }
  }, [audioUrl])

  // ── 播放器文案 ────────────────────────────────────────────
  const progress = audioDuration > 0 ? (audioCurrent / audioDuration) * 100 : 0
  const fallbackLine = L(
    post.previewLine || EXPERIENCE_LINES_ZH[post.id] || EXPERIENCE_LINES_ZH[1],
    post.previewLineEn || EXPERIENCE_LINES_EN[post.id] || EXPERIENCE_LINES_EN[1]
  )
  const displayLine = hasPreset
    ? (audioLoading ? L('语音准备中…', 'Preparing voice…') : audioError ? fallbackLine : (openingLine || fallbackLine))
    : fallbackLine
  const showRealPlayer = hasPreset && audioUrl && !audioError
  const showFakePlayer = !hasPreset || audioError
  const currentTimeStr = showRealPlayer ? formatAudioTime(audioCurrent) : `0:${String(8 + ((Number(post.id) || 1) * 7) % 48).padStart(2, '0')}`
  const totalTimeStr = showRealPlayer ? formatAudioTime(audioDuration) : `1:${String(18 + ((Number(post.id) || 1) * 5) % 38).padStart(2, '0')}`

  return (
    <article className={`relative h-full overflow-hidden rounded-[28px] bg-gradient-to-br ${imgColor} shadow-[0_24px_80px_rgba(0,0,0,0.45)]`}>
      {/* 隐藏的真实 audio 元素 */}
      {showRealPlayer && (
        <audio ref={audioRef} src={audioUrl} preload="auto" />
      )}

      {imgSrc && (
        <img
          src={imgSrc}
          alt=""
          onError={() => {
            if (imgSrc.endsWith('.jpg')) setImgSrc(`/images/posts/${imageId}.png`)
            else setImgSrc(null)
          }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {!imgSrc && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="select-none text-7xl opacity-35">{imgEmoji}</span>
        </div>
      )}

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.1)_35%,rgba(0,0,0,0.82)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/45 to-transparent" />

      <div className="absolute bottom-5 left-4 right-[82px] space-y-3">
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/35 text-xl backdrop-blur-md">
            {post.avatar}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-sm font-bold text-white">{displayName}</p>
              <GenderBadge gender={post.gender} />
            </div>
            <p className="text-[10px] text-white/55">{L(post.time, en?.time || post.time)}</p>
          </div>
          {isPresetAudioCard && (
            <span className="ml-auto rounded-full border border-[#FFB8D7]/25 bg-[#FF4FA3]/18 px-2 py-1 text-[9px] font-semibold text-[#FFD5E7] shadow-[0_0_14px_rgba(255,79,163,0.18)]">
              {L('预设语音包', 'Preset Pack')}
            </span>
          )}
        </div>

        <p className="line-clamp-3 text-[13px] leading-relaxed text-white/88 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
          {content}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {displayTags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full bg-white/12 px-2 py-1 text-[10px] font-medium text-white/78 backdrop-blur-md">
              {tag}
            </span>
          ))}
        </div>

        {/* ── 音频播放器 ──────────────────────────────────── */}
        <div className={`space-y-2 rounded-2xl border backdrop-blur-md p-3 transition-all ${
          audioLoading ? 'border-[#B380FF]/25 bg-[#B380FF]/8 animate-pulse' :
          audioError ? 'border-[rgba(255,100,100,0.2)] bg-[rgba(255,100,100,0.06)]' :
          showRealPlayer ? 'border-[#FF9ACB]/20 bg-black/28' :
          'border-white/12 bg-black/28'
        }`}>
          <div className="flex items-center gap-2">
            {/* 播放/暂停按钮 */}
            {showRealPlayer ? (
              <button
                onClick={handlePlayPause}
                disabled={!audioLoaded}
                className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-[#FF4FA3]/25 text-[#FFB8D7] transition-all active:scale-90 disabled:opacity-40"
              >
                {isPlaying ? <Pause size={13} /> : <Play size={13} className="ml-0.5" />}
              </button>
            ) : (
              <PlayCircle size={15} className={`flex-shrink-0 ${audioLoading ? 'text-[#B380FF] animate-pulse' : 'text-[#FFB8D7]'}`} />
            )}
            <p className={`min-w-0 flex-1 truncate text-[12px] font-semibold ${
              audioLoading ? 'text-[#B380FF]' : audioError ? 'text-[rgba(255,150,150,0.7)]' : 'text-white'
            }`}>
              {displayLine}
            </p>
            {/* 音频加载指示器 */}
            {audioLoading && (
              <span className="flex-shrink-0 h-3 w-3 rounded-full border-2 border-[#B380FF] border-t-transparent animate-spin" />
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="w-8 text-[9px] tabular-nums text-white/55">{currentTimeStr}</span>
            {/* 进度条 */}
            {showRealPlayer ? (
              <div
                ref={progressBarRef}
                className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/18 cursor-pointer"
                onClick={handleSeek}
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#FF7DAF] to-[#B380FF] shadow-[0_0_10px_rgba(255,125,175,0.55)] transition-[width] duration-150"
                  style={{ width: `${progress}%` }}
                />
                <span
                  className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.75)]"
                  style={{ left: `calc(${progress}% - 5px)` }}
                />
              </div>
            ) : (
              <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/18">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#FF7DAF] to-[#B380FF] shadow-[0_0_10px_rgba(255,125,175,0.55)]"
                  style={{ width: `${18 + ((Number(post.id) || 1) * 13) % 64}%` }}
                />
                <span
                  className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.75)]"
                  style={{ left: `calc(${18 + ((Number(post.id) || 1) * 13) % 64}% - 5px)` }}
                />
              </div>
            )}
            <span className="w-8 text-right text-[9px] tabular-nums text-white/55">{totalTimeStr}</span>
          </div>

          {/* 语音标签 */}
          {showRealPlayer && (
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00E676] shadow-[0_0_6px_rgba(0,230,118,0.55)]" />
              <span className="text-[9px] text-[rgba(0,230,118,0.7)]">
                {isPresetAudioCard ? L('内容流试听卡', 'Feed Audio Card') : L('AI 预设语音', 'AI Preset Voice')}
              </span>
            </div>
          )}
        </div>

        {post.templateName && (
          <button
            type="button"
            onClick={onTryTemplate}
            className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[#FF9ACB]/35 bg-[#FF4FA3]/18 px-3 py-2 text-[11px] font-semibold text-[#FFD5E7] backdrop-blur-md transition-all hover:bg-[#FF4FA3]/28 active:scale-[0.98]"
          >
            <Sparkles size={13} />
            <span className="truncate">{L('试用同款：', 'Try: ')}{displayTemplateName}</span>
          </button>
        )}
      </div>

      <div className="absolute bottom-7 right-4 flex flex-col items-center gap-3">
        <ReelAction icon={Heart} label={count.toLocaleString()} active={liked} onClick={onLike} />
        <ReelAction icon={MessageCircle} label={comments.toString()} onClick={onComment} />
        <ReelAction
          icon={Bookmark}
          label={saved ? L('已收藏', 'Saved') : L('收藏', 'Save')}
          active={saved}
          onClick={() => {
            setSaved((v) => !v)
            onSave()
          }}
        />
        <ReelAction icon={Send} label={L('分享', 'Share')} onClick={() => alert(L('分享功能即将开放', 'Share coming soon'))} />
        <ReelAction icon={Volume2} label={L('试听', 'Audio')} onClick={onTryTemplate} />
      </div>
    </article>
  )
}

function ExperienceReel({ posts, loading, likesMap, onLike, onTryTemplate, onComment, onSave }) {
  const L = useL()
  const [activeIndex, setActiveIndex] = useState(0)
  const touchStartY = useRef(null)
  const wheelLocked = useRef(false)
  const feedPosts = Array.isArray(posts) ? posts : []

  useEffect(() => {
    setActiveIndex(0)
  }, [posts])

  const move = (direction) => {
    setActiveIndex((idx) => {
      const next = idx + direction
      if (next < 0) return 0
      if (next >= feedPosts.length) return feedPosts.length - 1
      return next
    })
  }

  const handleWheel = (event) => {
    if (Math.abs(event.deltaY) < 18 || wheelLocked.current) return
    wheelLocked.current = true
    move(event.deltaY > 0 ? 1 : -1)
    window.setTimeout(() => {
      wheelLocked.current = false
    }, 520)
  }

  if (loading && posts.length === 0) {
    return (
      <div className="flex h-[calc(100dvh-10rem)] min-h-[560px] items-center justify-center rounded-[28px] bg-black/30">
        <p className="text-[12px] text-white/45 animate-pulse">{L('加载体验流中…', 'Loading experience feed…')}</p>
      </div>
    )
  }

  if (!feedPosts.length) return null

  const activePost = feedPosts[activeIndex] || feedPosts[0]
  const isPresetCard = activePost.type === 'preset-audio'

  return (
    <section
      className="-mx-4 mt-1 min-h-0 flex-1 px-3"
      onWheel={handleWheel}
      onTouchStart={(event) => {
        touchStartY.current = event.touches[0]?.clientY ?? null
      }}
      onTouchEnd={(event) => {
        if (touchStartY.current == null) return
        const endY = event.changedTouches[0]?.clientY ?? touchStartY.current
        const delta = touchStartY.current - endY
        touchStartY.current = null
        if (Math.abs(delta) > 44) move(delta > 0 ? 1 : -1)
      }}
    >
      <div className="relative h-full min-h-[360px] overflow-hidden">
        <div className="pointer-events-none absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full border border-white/12 bg-black/35 px-3 py-1.5 text-[10px] font-medium text-white/70 backdrop-blur-md">
          <span className={`h-1.5 w-1.5 rounded-full ${isPresetCard ? 'bg-[#FF9ACB]' : 'bg-[#B380FF]'} shadow-[0_0_8px_currentColor]`} />
          {isPresetCard ? L('预设语音包混排', 'Preset mixed in') : L('真实体验分享', 'Experience post')}
          <span className="text-white/35">{activeIndex + 1}/{feedPosts.length}</span>
        </div>
        <div className="h-full transition-all duration-300 ease-out" key={activePost.id}>
          <ReelSlide
            post={activePost}
            likeState={likesMap[activePost.id] || { liked: false, count: activePost.likes || 0 }}
            onLike={() => onLike(activePost.id)}
            onTryTemplate={() => onTryTemplate(activePost)}
            onComment={() => onComment(activePost)}
            onSave={() => onSave(activePost)}
          />
        </div>

      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════
//  AI 虚拟恋人卡片（接入 Grok）
// ═══════════════════════════════════════════════════════════

const MOOD_STYLES = {
  '暧昧': { bg: 'rgba(255,154,203,0.12)', border: 'rgba(255,154,203,0.18)' },
  '温柔': { bg: 'rgba(179,128,255,0.12)', border: 'rgba(179,128,255,0.15)' },
  '调皮': { bg: 'rgba(255,200,100,0.12)', border: 'rgba(255,200,100,0.18)' },
}

const RANDOM_LOADING_LINES = [
  '正在随机匹配体验内容…',
  '正在生成语音剧本…',
  '正在同步控制参数…',
]

const RANDOM_LOADING_LINES_EN = [
  'Matching random experiences…',
  'Generating voice script…',
  'Syncing control parameters…',
]

function LoverActionButtons({
  onChatWithLover,
  onRandomExperience,
  isRandomLoading,
  randomLoadingText,
  isChatDisabled,
}) {
  const L = useL()
  return (
    <div className="grid grid-cols-2 gap-2.5">
      <button
        onClick={onChatWithLover}
        disabled={isChatDisabled || isRandomLoading}
        className="rounded-full py-2 text-[11px] font-semibold text-white bg-gradient-to-r from-[#FF7DAF] to-[#A87CFF] shadow-[0_0_12px_rgba(179,128,255,0.35)] disabled:opacity-45 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
      >
        {L('关心一下你的AI恋人', 'Check on your AI Lover')}
      </button>
      <button
        onClick={onRandomExperience}
        disabled={isRandomLoading}
        className="rounded-full py-2 text-[11px] font-semibold text-[#E8DDF1] border border-[#B380FF]/35 bg-[rgba(179,128,255,0.12)] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
      >
        {isRandomLoading ? randomLoadingText : L('随机体验', 'Random')}
      </button>
    </div>
  )
}

function AiLoverCard({
  aiMemoryDeleted,
  onDeleteMemory,
  onResetMemory,
  onChatWithLover,
  onRandomExperience,
  isRandomLoading,
  randomLoadingText,
  isChatDisabled,
}) {
  const L = useL()
  const { clearMemory, fadeIn, loading, mood, refreshMessage, text } = useVirtualLover()

  const moodStyle = MOOD_STYLES[mood] || MOOD_STYLES['温柔']

  return (
    <div
      className="rounded-2xl p-4 card-glow cursor-pointer transition-all active:scale-[0.98]"
      style={{ background: 'linear-gradient(135deg, #1a1028, #251840)' }}
      onClick={() => {
        if (aiMemoryDeleted) {
          onResetMemory()
          refreshMessage()
        } else {
          refreshMessage()
        }
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-2xl bg-[rgba(179,128,255,0.2)] flex items-center justify-center text-xl flex-shrink-0">
          🤖
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-[rgba(245,240,242,0.9)]">{L('你的虚拟恋人', 'Your AI Lover')}</p>
        </div>
        {/* 呼吸点 */}
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{
            background: '#B380FF',
            boxShadow: '0 0 6px #B380FF',
            animation: 'pulse 2s ease-in-out infinite',
          }}
        />
      </div>

      {/* 消息气泡 */}
      {!aiMemoryDeleted ? (
        <div className="ml-13 space-y-3">
          <div
            className="rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-[12px] text-[rgba(245,240,242,0.85)] leading-relaxed min-h-[40px]"
            style={{
              background: moodStyle.bg,
              border: `1px solid ${moodStyle.border}`,
              opacity: fadeIn ? 1 : 0,
              transform: fadeIn ? 'translateY(0)' : 'translateY(4px)',
              transition: 'opacity 0.06s ease, transform 0.06s ease',
            }}
          >
            {loading && !text ? (
              <span className="inline-block text-[rgba(245,240,242,0.4)] animate-pulse">{L('思念加载中…', 'Loading thoughts…')}</span>
            ) : text ? (
              text
            ) : (
              <span className="inline-block text-[rgba(245,240,242,0.4)]">{L('暂无真实消息', 'No live message yet')}</span>
            )}
          </div>

          <LoverActionButtons
            onChatWithLover={(e) => {
              e.stopPropagation()
              onChatWithLover()
            }}
            onRandomExperience={(e) => {
              e.stopPropagation()
              onRandomExperience()
            }}
            isRandomLoading={isRandomLoading}
            randomLoadingText={randomLoadingText}
            isChatDisabled={isChatDisabled}
          />

          {/* 底部操作 */}
          <div className="flex items-center justify-between">
            <button
              onClick={async (e) => {
                e.stopPropagation()
                await clearMemory()
                onDeleteMemory()
              }}
              className="flex items-center gap-1.5 text-[10px] text-[rgba(245,240,242,0.35)] hover:text-[rgba(255,100,100,0.6)] transition-colors"
            >
              <Trash2 size={11} />
              {L('删除今晚的记忆', "Delete tonight's memory")}
            </button>
            <span className="text-[9px] text-[rgba(245,240,242,0.25)]">{loading ? L('更新中…', 'Updating…') : L('点击卡片换一句', 'Tap for new message')}</span>
          </div>
        </div>
      ) : (
        <div className="ml-13">
          <p className="text-[11px] text-[rgba(245,240,242,0.3)] italic">{L('记忆已清除，这段时光只存在于当时。', 'Memory cleared. That moment exists only in the past.')}</p>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
//  主组件
// ═══════════════════════════════════════════════════════════

export default function CommunityPage() {
  const TABS = ['体验分享', '攻略教程', '创作展示']
  const TAB_EN = { '体验分享': 'Experiences', '攻略教程': 'Guides', '创作展示': 'Creations' }
  const navigate = useNavigate()
  const { lang, showToast } = useApp()
  const L = useL()

  // ── 真实预设语音包数据 ───────────────────────────────────
  const [currentTab, setCurrentTab] = useState('体验分享')
  const {
    posts: presetAudioPosts,
    loading: presetAudioLoading,
    error: presetAudioError,
    refresh: refreshPresetAudio,
  } = usePresetAudioFeed(lang)
  const isExperienceTab = currentTab === '体验分享'
  const posts = isExperienceTab ? presetAudioPosts : []
  const loading = isExperienceTab ? presetAudioLoading : false
  const error = isExperienceTab ? presetAudioError : null
  const refresh = isExperienceTab ? refreshPresetAudio : () => {}
  const switchTab = (tab) => setCurrentTab(tab)

  // ── 点赞状态（每个帖子独立）────────────────────────────
  const [likesMap, setLikesMap] = useState(() => {
    const map = {}
    posts.forEach((post) => {
      map[post.id] = { liked: false, count: post.likes || 0 }
    })
    return map
  })

  useEffect(() => {
    setLikesMap((prev) => {
      const next = { ...prev }
      posts.forEach((post) => {
        if (!next[post.id]) next[post.id] = { liked: false, count: post.likes || 0 }
      })
      return next
    })
  }, [posts])

  // ── AI 记忆状态 ──────────────────────────────────────────
  const [aiMemoryDeleted, setAiMemoryDeleted] = useState(false)
  const [isRandomLoading, setIsRandomLoading] = useState(false)
  const [loadingLineIdx, setLoadingLineIdx] = useState(0)

  const currentLover = {
    id: 'default-lover-luna',
    name: 'Luna',
    avatar: 'L',
  }

  const handleChatWithLover = () => {
    if (!currentLover?.id || aiMemoryDeleted) {
      showToast(L('当前恋人暂不可对话', 'Current lover unavailable for chat'))
      return
    }
    navigate('/ai-lover/chat', {
      state: {
        lover: currentLover,
        from: 'community-ai-lover-card',
      },
    })
  }

  const handleRandomExperience = async () => {
    if (isRandomLoading) return
    showToast(L('暂无真实随机体验接口', 'No live random experience API yet'))
  }

  // ── 点赞切换 ─────────────────────────────────────────────
  const toggleLike = (postId) => {
    setLikesMap((prev) => {
      const cur = prev[postId] || { liked: false, count: 0 }
      return {
        ...prev,
        [postId]: {
          liked: !cur.liked,
          count: cur.liked ? cur.count - 1 : cur.count + 1,
        },
      }
    })
  }

  const handleTryTemplate = (post) => {
    const displayTemplateName = L(post.templateName, COMMUNITY_TEMPLATE_EN[post.templateName] || post.templateName || '')
    showToast(L('正在打开同款体验：', 'Opening experience: ') + displayTemplateName)
    navigate('/player', {
      state: {
        templateId: post.templateId,
        templateName: post.templateName,
        source: 'community-experience-reel',
      },
    })
  }

  const handleComment = () => {
    showToast(L('评论功能即将开放', 'Comments coming soon'))
  }

  const handleSave = () => {
    showToast(L('已更新收藏状态', 'Saved state updated'))
  }

  return (
    <div
      className={
        isExperienceTab
          ? 'relative flex h-[calc(100dvh-7.5rem)] flex-col gap-4 overflow-hidden px-4 pb-2 pt-4 page-enter'
          : 'relative space-y-4 px-4 pb-24 pt-4 page-enter'
      }
    >

      {/* ═══ 顶部 Tab ════════════════════════════════════════ */}
      <div className="sticky top-0 z-20 flex flex-shrink-0 rounded-2xl border border-white/5 bg-[rgba(20,14,18,0.82)] p-1 shadow-[0_12px_28px_rgba(0,0,0,0.22)] backdrop-blur-md page-section page-delay-1">
        {/* 滑动高亮块 */}
        <div
          className="absolute top-1 bottom-1 rounded-xl bg-[rgba(255,154,203,0.15)] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          style={{
            width: `calc(${100 / TABS.length}% - 2px)`,
            transform: `translateX(calc(${TABS.indexOf(currentTab)} * (100% + 2px)))`,
          }}
        />
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => switchTab(tab)}
            className={`
              relative flex-1 py-2 rounded-xl text-[11px] font-medium transition-colors duration-200
              ${currentTab === tab
                ? 'text-[#FF9ACB]'
                : 'text-[rgba(245,240,242,0.45)]'
              }
            `}
          >
            {L(tab, TAB_EN[tab])}
          </button>
        ))}
      </div>

      {/* ═══ AI 主动关怀卡片（接入 Grok AI）═══════════════════ */}
      <div className="flex-shrink-0 page-section page-delay-2">
        <AiLoverCard
          aiMemoryDeleted={aiMemoryDeleted}
          onResetMemory={() => setAiMemoryDeleted(false)}
          onDeleteMemory={() => {
          if (window.confirm(L('确定删除今晚的记忆吗？此操作不可撤销。', "Delete tonight's memory? This cannot be undone."))) {
            setAiMemoryDeleted(true)
            alert(L('🗑️ 记忆已删除', '🗑️ Memory deleted'))
          }
          }}
          onChatWithLover={handleChatWithLover}
          onRandomExperience={handleRandomExperience}
          isRandomLoading={isRandomLoading}
          randomLoadingText={L(RANDOM_LOADING_LINES[loadingLineIdx], RANDOM_LOADING_LINES_EN[loadingLineIdx])}
          isChatDisabled={aiMemoryDeleted || !currentLover?.id}
        />
      </div>

      {/* ═══ 加载状态 ════════════════════════════════════════ */}
      {loading && posts.length === 0 && !isExperienceTab && (
        <div className="flex justify-center items-center py-12 page-section page-delay-3">
          <div className="text-center">
            <p className="text-[12px] text-[rgba(245,240,242,0.4)] animate-pulse">{L('加载社区帖子中…', 'Loading community posts…')}</p>
          </div>
        </div>
      )}

      {/* ═══ 错误显示 ════════════════════════════════════════ */}
      {error && (
        <div className="rounded-2xl p-4 bg-[rgba(255,100,100,0.1)] border border-[rgba(255,100,100,0.2)] page-section page-delay-3">
          <p className="text-[12px] text-[rgba(255,100,100,0.8)]">⚠️ {error}</p>
          <button
            onClick={() => refresh()}
            className="mt-2 text-[11px] text-[#FF9ACB] hover:opacity-80"
          >
            {L('🔄 重试', '🔄 Retry')}
          </button>
        </div>
      )}

      {/* ═══ 帖子列表 ════════════════════════════════════════ */}
      {posts.length > 0 && isExperienceTab && (
        <ExperienceReel
          posts={posts}
          loading={loading}
          likesMap={likesMap}
          onLike={toggleLike}
          onTryTemplate={handleTryTemplate}
          onComment={handleComment}
          onSave={handleSave}
        />
      )}

      {posts.length > 0 && !isExperienceTab && (
        <div className={`space-y-3 transition-opacity duration-150 page-section page-delay-3 ${loading ? 'opacity-72' : 'opacity-100'}`}>
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              likeState={likesMap[post.id] || { liked: false, count: 0 }}
              onLike={() => toggleLike(post.id)}
            />
          ))}
        </div>
      )}

      {/* ═══ 空状态 ══════════════════════════════════════════ */}
      {!loading && posts.length === 0 && !error && (
        <div className="flex justify-center items-center py-12 page-section page-delay-3">
          <p className="text-[12px] text-[rgba(245,240,242,0.4)]">{L('暂无帖子，敬请期待', 'No posts yet, stay tuned')}</p>
        </div>
      )}

      {/* ═══ 隐私提示 ════════════════════════════════════════ */}
      {!isExperienceTab && (
      <div className="pt-2 pb-4 text-center page-section page-delay-4">
        <p className="text-[10px] text-[rgba(245,240,242,0.25)] leading-relaxed">
          {L('所有内容匿名发布，本地加密。可随时清除记忆。', 'All content posted anonymously with local encryption. Memory can be cleared anytime.')}
        </p>
      </div>
      )}

      {/* ═══ 悬浮"发布新帖"按钮 ══════════════════════════════ */}
      {/*
       * fixed 定位，计算公式确保按钮始终在手机容器（max-w-430px）右下角
       * 在宽屏上：right = (viewport - 430) / 2 + 16
       * 在窄屏上：right = max(16px, 上面公式结果)
       * TODO: 实现真实发帖功能（文本/图片上传 + 匿名加密）
       */}
      {!isExperienceTab && (
      <button
        onClick={() => alert(L('✍️ 创作功能即将开放！\n期待你的精彩内容~', '✍️ Creation feature coming soon!\nStay tuned for your amazing content~'))}
        className="
          fixed z-30
          w-12 h-12 rounded-2xl
          flex items-center justify-center
          btn-main text-white shadow-lg
          transition-all active:scale-90
        "
        style={{
          bottom: '88px',
          right: 'max(16px, calc((100vw - 430px) / 2 + 16px))',
        }}
        aria-label={L('发布新帖', 'New Post')}
      >
        <Plus size={22} />
      </button>
      )}
    </div>
  )
}
