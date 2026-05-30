/**
 * HomePage.jsx — 互动主场景 v7 (重构版)
 *
 * v7 变更：
 *   • 数据常量提取到 src/data/ (characters, scenes, scripts, interactData)
 *   • 子组件提取到 src/components/home/ (ScriptCards, SelectCards, InteractWidgets)
 *   • 本文件仅保留主逻辑 + 视图编排
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { Sparkles, Pause, Play, Flame } from 'lucide-react'
import { useApp } from '../context/AppContext'
import {
  HeaderStatusBar,
  SceneTimeline,
  RhythmModeGrid,
  AiParameterCards,
  DeviceStatusFooter,
  getStageIndexByProgress,
} from '../components/InteractEnhancements'
import { ScriptCard, GeneratedScriptCard } from '../components/home/ScriptCards'
import { CharSelectCard, SceneSelectCard } from '../components/home/SelectCards'
import { Waveform, HeartRain, SliderControl } from '../components/home/InteractWidgets'
import { CHARACTERS } from '../data/characters'
import { SCENES } from '../data/scenes'
import { SCRIPTS, SCRIPT_DESCRIPTIONS, SCRIPT_DESCRIPTIONS_EN, BG_VIDEO_IDS } from '../data/scripts'
import { PRESETS, TOTAL_SECONDS, pick, formatTime, generateHearts } from '../data/interactData'
import {
  prepareCustomPromptAudio,
  preparePresetVoiceAudio,
} from '../api/scripts'
import { useL } from '../i18n/useL'

function resolveApiUrl(path) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path) || path.startsWith('data:')) return path
  const base = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')
  return base ? `${base}${path.startsWith('/') ? path : `/${path}`}` : path
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ── 输入提示词数据 ─────────────────────────────────
const PROMPT_TABS = {
  zh: [
    { id: 'hot',     label: '🔥 热门' },
    { id: 'office',  label: '🏢 职场' },
    { id: 'campus',  label: '🎓 校园' },
    { id: 'fantasy', label: '🔒 禁忌' },
  ],
  en: [
    { id: 'hot',     label: '🔥 Hot' },
    { id: 'office',  label: '🏢 Office' },
    { id: 'campus',  label: '🎓 Campus' },
    { id: 'fantasy', label: '🔒 Taboo' },
  ],
}
const PROMPT_SUGGESTIONS = {
  zh: {
    hot: [
      { id: 'hot_01', text: '办公室冷感女上司加班时突然变得温柔', role: '女上司' },
      { id: 'hot_02', text: '宿舍深夜学妹对我说「学长…室友今晚不回了」', role: '学妹' },
      { id: 'hot_03', text: '跨城跨年前女友雨夜突然敲门', role: '前女友' },
      { id: 'hot_04', text: '深夜超市邻居少妇一直靠着我结账', role: '少妇' },
    ],
    office: [
      { id: 'office_01', text: '女上司隔着玻璃给我传小纸条，却一直盯着我笑', role: '女上司' },
      { id: 'office_02', text: '秘书整理文件时身体不小心靠了过来', role: '秘书' },
      { id: 'office_03', text: '加班到最后一个，总裁关门前说「送你回去吧」', role: '女上司' },
      { id: 'office_04', text: '实习生发错文件，被女上司说「进我办公室」', role: '女上司' },
    ],
    campus: [
      { id: 'campus_01', text: '图书馆学妹挪到我旁边轻声说「这题教我好不好」', role: '学妹' },
      { id: 'campus_02', text: '宿舍小万说「就咱俩还没吃呢，一起吧」', role: '邓邓' },
      { id: 'campus_03', text: '班花说忘带内衣，顺手把小外套在我面前脱了', role: '班花' },
      { id: 'campus_04', text: '学妹说「学长，我就想问你一件事」目光从未离开', role: '学妹' },
    ],
    fantasy: [
      { id: 'fantasy_01', text: '深夜迟归遇见邻居少妇，她说「别报警，我就住隔壁」', role: '少妇' },
      { id: 'fantasy_02', text: '女神说只要赢了两局就可以直接带我回家', role: '女神' },
      { id: 'fantasy_03', text: '老师和我走进恰好就我们两个人的资料室', role: '女老师' },
      { id: 'fantasy_04', text: '前女友连夜发来十九条消息，最后一条就三个字', role: '前女友' },
    ],
  },
  en: {
    hot: [
      { id: 'hot_01', text: 'My cold boss suddenly gets tender during overtime at the office', role: 'Boss' },
      { id: 'hot_02', text: 'Late night, my junior whispers "Senpai… my roommate isn\'t coming back tonight"', role: 'Junior' },
      { id: 'hot_03', text: 'Ex-girlfriend shows up at my door on a rainy New Year\'s Eve', role: 'Ex-GF' },
      { id: 'hot_04', text: 'The neighbor lady leans on me the whole time at the late-night store', role: 'Neighbor' },
    ],
    office: [
      { id: 'office_01', text: 'My boss passes me a note through the glass, smiling the whole time', role: 'Boss' },
      { id: 'office_02', text: 'The secretary accidentally leans in while sorting files', role: 'Secretary' },
      { id: 'office_03', text: 'Last one working late—the CEO says "Let me take you home"', role: 'Boss' },
      { id: 'office_04', text: 'Intern sends the wrong file, boss says "Step into my office"', role: 'Boss' },
    ],
    campus: [
      { id: 'campus_01', text: 'A girl moves next to me in the library and whispers "Can you help me with this?"', role: 'Junior' },
      { id: 'campus_02', text: 'My dormmate says "It\'s just us who haven\'t eaten yet, let\'s go together"', role: 'Dormmate' },
      { id: 'campus_03', text: 'The class beauty forgot something and casually takes off her jacket in front of me', role: 'Beauty' },
      { id: 'campus_04', text: 'She says "I just wanted to ask you one thing" with her eyes fixed on mine', role: 'Junior' },
    ],
    fantasy: [
      { id: 'fantasy_01', text: 'Coming home late, I run into my neighbor who says "Don\'t worry, I live right next door"', role: 'Neighbor' },
      { id: 'fantasy_02', text: 'The goddess says if I win two rounds, she\'ll take me straight home', role: 'Goddess' },
      { id: 'fantasy_03', text: 'Teacher and I walk into the archive room—just the two of us', role: 'Teacher' },
      { id: 'fantasy_04', text: 'My ex sends 19 messages overnight—the last one is just three words', role: 'Ex-GF' },
    ],
  },
}

// ── 生成等待区：圆形进度 + 轮播暧昧文案 ─────────────────────
const TEASER_LINES = {
  zh: [
    '正在生成个性化互动内容…',
    '正在匹配语音卡风格与节奏…',
    '正在同步AI智能设备响应模式…',
    '正在构建沉浸式体验场景…',
    '正在优化本次互动流程…',
    '正在加载专属体验参数…',
    '正在校准设备反馈节奏…',
    '正在生成智能联动方案…',
    '正在完善本次体验细节…',
    '正在完成专属互动系统…',
  ],
  en: [
    'Generating personalized content…',
    'Matching voice card style & rhythm…',
    'Syncing AI smart device response…',
    'Building immersive experience scene…',
    'Optimizing interaction flow…',
    'Loading custom experience parameters…',
    'Calibrating device feedback rhythm…',
    'Generating smart sync plan…',
    'Refining experience details…',
    'Finalizing custom interaction system…',
  ],
}

const CIRCLE_RADIUS = 38
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS // ≈ 238.76

function LoadingPanel({ progress, phase, onEnter, onRetry, remainingQuota = 2, totalQuota = 3 }) {
  const { lang } = useApp()
  const L = useL()
  const teaserLines = TEASER_LINES[lang] || TEASER_LINES.zh
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)
  const [showVipModal, setShowVipModal] = useState(false)

  useEffect(() => {
    if (phase === 'done') return
    const cycle = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIdx(i => (i + 1) % teaserLines.length)
        setVisible(true)
      }, 400)
    }, 2000)
    return () => clearInterval(cycle)
  }, [phase])

  const offset = CIRCLE_CIRCUMFERENCE * (1 - progress / 100)
  const isDone = phase === 'done'

  return (
    <section className="animate-fadeUp">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm">✨</span>
        <h2 className="text-sm font-semibold text-[rgba(245,240,242,0.85)] tracking-wide">{L('为你定制', 'Crafted for You')}</h2>
      </div>
      <div
        className="rounded-2xl flex flex-col items-center justify-center py-8 px-6 gap-4"
        style={{ background: 'linear-gradient(135deg, rgba(179,128,255,0.10), rgba(255,154,203,0.08))' }}
      >
        {/* ── 主标题 + 副文案 ── */}
        {!isDone && (
          <div className="text-center space-y-1.5">
            <p className="text-sm font-semibold text-[rgba(245,240,242,0.92)] tracking-wide">
              ✨ {L('AI正在为你定制体验', 'AI is crafting your experience')}
            </p>
          </div>
        )}

        {/* ── 圆形进度环 ── */}
        <div className="relative" style={{ width: 96, height: 96 }}>
          <svg width="96" height="96" style={{ transform: 'rotate(-90deg)' }}>
            {/* 轨道 */}
            <circle
              cx="48" cy="48" r={CIRCLE_RADIUS}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="5"
            />
            {/* 进度弧 */}
            <circle
              cx="48" cy="48" r={CIRCLE_RADIUS}
              fill="none"
              stroke="url(#progGrad)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={CIRCLE_CIRCUMFERENCE}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 0.4s ease' }}
            />
            <defs>
              <linearGradient id="progGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF9ACB" />
                <stop offset="100%" stopColor="#B380FF" />
              </linearGradient>
            </defs>
          </svg>
          {/* 中心文字 */}
          <div className="absolute inset-0 flex items-center justify-center">
            {isDone
              ? <span className="text-2xl">✨</span>
              : <span className="text-white font-bold text-base">{progress}%</span>
            }
          </div>
        </div>

        {/* ── 免费额度 + VIP 提示 ── */}
        {!isDone && (
          <div className="text-center space-y-1.5">
            <p className="text-[11px] text-[rgba(245,240,242,0.50)]">
              {L('本月免费额度：', 'Monthly free quota: ')}<span className="text-white font-semibold">{remainingQuota}</span>
              <span className="text-[rgba(245,240,242,0.35)]"> / {totalQuota}</span>
            </p>
            <p
              className="text-[10px] text-[rgba(245,240,242,0.35)] mt-0.5"
            >
              {L('升级VIP解锁无限次数', 'Upgrade to VIP for unlimited access')}
            </p>
            <button
              onClick={() => setShowVipModal(true)}
              className="mt-2 px-5 py-1.5 rounded-full text-[11px] font-semibold text-white shadow-lg active:scale-95 transition-all"
              style={{
                background: 'linear-gradient(135deg, #FF9ACB, #B380FF)',
                boxShadow: '0 0 14px rgba(179,128,255,0.45)',
              }}
            >
              ✨ {L('立即升级VIP', 'Upgrade to VIP')}
            </button>
          </div>
        )}

        {/* ── 轮播文案 / 完成进入按钮 ── */}
        {isDone ? (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={onEnter}
              className="px-6 py-2.5 rounded-full text-white text-sm font-semibold"
              style={{
                background: 'linear-gradient(135deg, #FF9ACB, #B380FF)',
                boxShadow: '0 0 18px rgba(179,128,255,0.5)',
                animation: 'pulse 1.6s ease-in-out infinite',
              }}
            >
              {L('现在进入 →', 'Enter Now →')}
            </button>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="text-[10px] font-medium text-[rgba(245,240,242,0.42)] underline underline-offset-4 decoration-white/20 active:scale-95 transition-all"
              >
                {L('不满意？再次尝试', 'Not right? Try again')}
              </button>
            )}
          </div>
        ) : (
          <p
            className="text-[13px] font-medium tracking-wide text-center px-6 transition-opacity duration-400"
            style={{
              opacity: visible ? 1 : 0,
              background: 'linear-gradient(135deg, #FF9ACB, #B380FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {teaserLines[idx]}
          </p>
        )}
      </div>

      {/* ── VIP 会员升级弹框 ── */}
      {showVipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowVipModal(false)}>
          <div
            className="w-[85vw] max-w-sm rounded-3xl p-6 space-y-5"
            style={{ background: 'linear-gradient(160deg, #1A0E2E 0%, #0D0612 100%)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* 标题 */}
            <div className="text-center space-y-1">
              <p className="text-lg font-bold text-white">✨ {L('升级VIP会员', 'Upgrade to VIP')}</p>
              <p className="text-[11px] text-[rgba(245,240,242,0.45)]">{L('解锁全部专属权益，畅享无限体验', 'Unlock all benefits, enjoy unlimited access')}</p>
            </div>

            {/* 权益列表 */}
            <div className="space-y-3">
              {[
                { icon: '♾️', title: L('无限AI生成', 'Unlimited AI'), desc: L('不限次数定制专属体验', 'Unlimited custom experiences') },
                { icon: '🎭', title: L('全角色解锁', 'All Characters'), desc: L('畅享所有角色与剧本', 'Access all characters & scripts') },
                { icon: '🎧', title: L('高保真语音', 'HD Voice'), desc: L('AI语音卡优先生成', 'Priority AI voice generation') },
                { icon: '⚡', title: L('极速生成', 'Turbo Speed'), desc: L('专属加速通道，秒级响应', 'Dedicated fast lane, instant response') },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ background: 'rgba(179,128,255,0.08)' }}>
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <p className="text-xs font-semibold text-white">{item.title}</p>
                    <p className="text-[10px] text-[rgba(245,240,242,0.40)]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 开通按钮 */}
            <button
              onClick={() => setShowVipModal(false)}
              className="w-full py-3 rounded-full text-sm font-bold text-white active:scale-[0.97] transition-transform"
              style={{
                background: 'linear-gradient(135deg, #FF9ACB, #B380FF)',
                boxShadow: '0 0 20px rgba(179,128,255,0.5)',
              }}
            >
              {L('立即开通 VIP · $9.99/月 · $59.99/年', 'Subscribe VIP · $9.99/mo · $59.99/yr')}
            </button>

            {/* 关闭 */}
            <p className="text-center text-[10px] text-[rgba(245,240,242,0.30)] cursor-pointer" onClick={() => setShowVipModal(false)}>
              {L('稍后再说', 'Maybe Later')}
            </p>
          </div>
        </div>
      )}
    </section>
  )
}

export default function HomePage() {
  const {
    isGenerating, setIsGenerating,
    genProgress, setGenProgress,
    genPhase, setGenPhase,
    generatedScripts, setGeneratedScripts,
    genTimerRef, phase2bTimerRef, ttsReadyRef,
    lang,
  } = useApp()
  const L = useL()
  const d = (item, field) => (lang === 'en' && item?.[field + 'En']) || item?.[field]
  const promptTabs = PROMPT_TABS[lang] || PROMPT_TABS.zh
  const promptSugs = PROMPT_SUGGESTIONS[lang] || PROMPT_SUGGESTIONS.zh

  // ── 视图状态（'select' | 'interact'）──────────────────────
  const [view, setView] = useState('select')

  // ── 自定义剧本 ───────────────────────────────────────────
  const [customPrompt,     setCustomPrompt]     = useState('')
  const [showSuggestions,  setShowSuggestions]  = useState(false)
  const [suggestionTab,    setSuggestionTab]    = useState('hot')
  const [selectedPresetId, setSelectedPresetId] = useState(null)
  // generatedScripts: 由全局 AppContext 提供
  // isGenerating / genProgress / genPhase: 由全局 AppContext 提供

  // ── 定制剧本选择状态 ─────────────────────────────────────
  // TODO: 接入后端后，selectedCharId / selectedSceneId 可持久化到用户偏好
  const [selectedCharId,  setSelectedCharId]  = useState(null)
  const [selectedSceneId, setSelectedSceneId] = useState(null)

  // ── 当前激活剧本 ─────────────────────────────────────────
  const [activeScript, setActiveScript] = useState(null)

  // ── 互动状态 ─────────────────────────────────────────────
  const [temperature,     setTemperature]     = useState(0)
  const [displayedText,   setDisplayedText]   = useState('')
  const [isTyping,        setIsTyping]        = useState(false)
  const [showDeviceNotif, setShowDeviceNotif] = useState(false)
  const [isVoiceActive,   setIsVoiceActive]   = useState(false)
  const [showHearts,      setShowHearts]      = useState(false)
  const [hearts,          setHearts]          = useState([])
  const [avatarPop,       setAvatarPop]       = useState(false)

  // ── 剧本详情弹窗 ─────────────────────────────────────────
  const [showScriptDetail, setShowScriptDetail] = useState(false)

  // ── 播放暂停状态 ─────────────────────────────────────────
  const [isPaused, setIsPaused] = useState(false)

  // ── 交互模式背景类型（video → image → emoji 链式回退）──
  const [bgType, setBgType] = useState('video')

  // ── 震动模式（保留供将来扩展） ──────────────────────────
  const [vibMode, setVibMode] = useState('slow')

  // ── 设备控制滑块（频率 / 强度 / 紧度，1-10）────────────
  // TODO: 接入真实蓝牙设备控制接口 (setDeviceParam)
  const [freq,   setFreq]   = useState(5)
  const [intens, setIntens] = useState(5)
  const [tight,  setTight]  = useState(5)

  // ── 剧本进度（0-100，初始 35）────────────────────────────
  const [progressValue, setProgressValue] = useState(35)

  // ── TTS 音频总时长（秒），AI 模式下动态更新 ──────────────
  const [audioDuration, setAudioDuration] = useState(TOTAL_SECONDS)

  // ── 音波实时振幅（10 根条的 0-1 值，null = 使用 CSS 动画）─
  const [waveformLevels, setWaveformLevels] = useState(null)

  // ── 新增：控制模式切换（'ai' | 'manual'）────────────────
  // TODO: 接入后端后可持久化用户偏好到 /api/user/preferences
  const [controlMode, setControlMode] = useState('ai')

  // ── 新增：AI节奏模式选择 ─────────────────────────────────
  // TODO: 接入 /api/ai/set-rhythm-mode 后传递实际模式参数
  const [rhythmMode, setRhythmMode] = useState('adaptive')

  // ── 新增：AI参数（独立于旧手动 slider，0-100 范围）────────
  // TODO: 接入 /api/ai/set-param 后传递 aiIntens / aiFreq
  const [aiIntens, setAiIntens] = useState(50)
  const [aiFreq,   setAiFreq]   = useState(36.8)

  // ── Refs ─────────────────────────────────────────────────
  const typingTimerRef = useRef(null)
  const heartsTimerRef = useRef(null)
  const autoTextCbRef  = useRef(null)
  const temperatureRef = useRef(0)
  const dragScrollStateRef = useRef({
    pointerId: null,
    container: null,
    startX: 0,
    startY: 0,
    startScrollLeft: 0,
    moved: false,
    axis: null,
  })
  const suppressHorizontalClickRef = useRef(false)
  // TODO: 替换 /audio/demo.mp3 为真实场景配乐（后续可按 activeScript.id 动态切换音频）
  const audioRef = useRef(null)
  const openingAudioRef = useRef(null)
  const pendingOpeningLineRef = useRef(null)
  // Web Audio API refs（音波可视化）
  const audioCtxRef      = useRef(null)
  const analyserRef      = useRef(null)
  const waveAnimFrameRef = useRef(null)
  const connectedElRef   = useRef(null)

  // 同步 temperature 到 ref（供 interval 回调读取最新值）
  useEffect(() => { temperatureRef.current = temperature }, [temperature])

  // ── 衍生数据 ─────────────────────────────────────────────
  const activeChar  = activeScript ? CHARACTERS.find(c => c.id === activeScript.charId) : null
  const activeScene = activeScript ? SCENES.find(s => s.id === activeScript.sceneId)    : null
  // AI 生成模式用 TTS 实际时长，其他模式用固定会话时长
  const hasScriptAudio = Boolean(activeScript?.audioBase64 || activeScript?.audioUrl)
  const displayTotalSeconds = activeScript?.isAIGenerated || hasScriptAudio ? audioDuration : TOTAL_SECONDS
  const isIntimate  = temperature >= 60
  const tempFull    = temperature >= 100

  // 交互模式显示：AI/内容池剧本优先使用生成结果，普通剧本使用角色字段
  const displayEmoji = activeScript?.isCustom || activeScript?.isAIGenerated ? activeScript.cover : activeChar?.emoji
  const displayName  = activeScript?.isCustom
    ? activeScript.customDisplayName
    : activeScript?.isAIGenerated
      ? d(activeScript, 'name')
      : d(activeChar, 'name')
  const displayTag   = activeScript?.isCustom
    ? activeScript.customTag
    : activeScript?.isAIGenerated
      ? d(activeScript, 'personalityTag')
      : d(activeChar, 'tag')

  // 场景氛围叠加色（随温度变深）
  const overlayStyle = activeScene
    ? { background: `rgba(${activeScene.overlayRgb}, ${(temperature / 100) * 0.35})`, transition: 'background 0.8s ease' }
    : {}

  // 场景氛围文字（三阶段）
  const ambianceObj = activeScene ? ((lang === 'en' && activeScene.ambianceEn) || activeScene.ambiance) : null
  const ambianceText = ambianceObj
    ? (temperature >= 60 ? ambianceObj.hot  :
       temperature >= 20 ? ambianceObj.warm :
                           ambianceObj.idle)
    : ''

  // 主按钮文字
  const buttonLabel = temperature === 0 ? L('轻触开始', 'Tap to Start') : isIntimate ? L('继续靠近', 'Get Closer') : L('继续触碰', 'Keep Touching')

  // 定制剧本"开始互动"按钮是否可用
  const canStartCustom = !!selectedCharId && !!selectedSceneId

  const handleHorizontalDragStart = useCallback((event) => {
    // Touch uses native momentum scrolling; only keep custom drag for mouse.
    if (event.pointerType !== 'mouse') return
    if (event.button !== 0) return
    dragScrollStateRef.current = {
      pointerId: event.pointerId,
      container: event.currentTarget,
      startX: event.clientX,
      startY: event.clientY,
      startScrollLeft: event.currentTarget.scrollLeft,
      moved: false,
      axis: null,
    }
    // 不在 pointerdown 时立即 capture，否则子按鈕收不到 pointerup 导致点击失效
  }, [])

  const handleHorizontalDragMove = useCallback((event) => {
    if (event.pointerType !== 'mouse') return
    const dragState = dragScrollStateRef.current
    if (dragState.pointerId !== event.pointerId) return

    const deltaX = event.clientX - dragState.startX
    const deltaY = event.clientY - dragState.startY

    if (!dragState.axis) {
      if (Math.abs(deltaX) < 6 && Math.abs(deltaY) < 6) return
      dragState.axis = Math.abs(deltaX) > Math.abs(deltaY) ? 'x' : 'y'
    }

    if (dragState.axis !== 'x') return

    if (!dragState.moved && Math.abs(deltaX) > 6) {
      dragState.moved = true
      suppressHorizontalClickRef.current = true
      // 确认是水平拖动后再 capture，这时子按鈕的 click 已经不会再触发
      event.currentTarget.setPointerCapture?.(event.pointerId)
    }

    if (!dragState.moved) return

    event.preventDefault()
    event.currentTarget.scrollLeft = dragState.startScrollLeft - deltaX
  }, [])

  const handleHorizontalDragEnd = useCallback((event) => {
    if (event.pointerType !== 'mouse') return
    const dragState = dragScrollStateRef.current
    if (dragState.pointerId !== event.pointerId) return
    event.currentTarget.releasePointerCapture?.(event.pointerId)

    dragScrollStateRef.current = {
      pointerId: null,
      container: null,
      startX: 0,
      startY: 0,
      startScrollLeft: 0,
      moved: false,
      axis: null,
    }
    if (suppressHorizontalClickRef.current) {
      window.setTimeout(() => {
        suppressHorizontalClickRef.current = false
      }, 0)
    }
  }, [])

  const handleHorizontalClickCapture = useCallback((event) => {
    if (!suppressHorizontalClickRef.current) return
    event.preventDefault()
    event.stopPropagation()
    suppressHorizontalClickRef.current = false
  }, [])

  const handleHorizontalWheel = useCallback((event) => {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return
    event.preventDefault()
    event.currentTarget.scrollLeft += event.deltaY
  }, [])

  // ── 打字机效果 ───────────────────────────────────────────
  const typeText = useCallback((text) => {
    if (typingTimerRef.current) clearInterval(typingTimerRef.current)
    setIsTyping(true)
    setDisplayedText('')
    let i = 0
    typingTimerRef.current = setInterval(() => {
      i++
      setDisplayedText(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(typingTimerRef.current)
        setIsTyping(false)
      }
    }, 50)
  }, [])

  // ── 设备响应通知（气泡）──────────────────────────────────
  // TODO: 替换为真实蓝牙设备强度控制 (setIntensity)
  const triggerDeviceNotif = useCallback(() => {
    setShowDeviceNotif(true)
    setTimeout(() => setShowDeviceNotif(false), 1200)
  }, [])

  // ── 头像弹跳动画 ─────────────────────────────────────────
  const triggerAvatarPop = useCallback(() => {
    setAvatarPop(false)
    requestAnimationFrame(() => requestAnimationFrame(() => setAvatarPop(true)))
    setTimeout(() => setAvatarPop(false), 400)
  }, [])

  // ── 增加情绪温度 ─────────────────────────────────────────
  const increaseTemp = useCallback((delta) => {
    setTemperature((prev) => {
      const next = Math.min(prev + delta, 100)
      if (next >= 100) {
        const hs = generateHearts(35)
        setHearts(hs)
        setShowHearts(true)
        if (heartsTimerRef.current) clearTimeout(heartsTimerRef.current)
        heartsTimerRef.current = setTimeout(() => setShowHearts(false), 4500)
      }
      return next
    })
  }, [])

  // ── 随机选取角色回应句 ───────────────────────────────────
  // TODO: 替换为真实 LLM 接口 (getAIResponse)
  const pickResponse = useCallback((isIntimateMode) => {
    if (!activeChar) return ''
    const responses = (lang === 'en' && activeChar.responsesEn) || activeChar.responses
    const pool = isIntimateMode ? responses.intimate : responses.normal
    return pick(pool)
  }, [activeChar, lang])

  // ── 自动文案更新（每 3 秒换一句）────────────────────────
  useEffect(() => {
    autoTextCbRef.current = () => {
      if (!activeChar) return
      typeText(pickResponse(temperatureRef.current >= 60))
    }
  })

  useEffect(() => {
    if (view !== 'interact') return
    if (pendingOpeningLineRef.current) {
      typeText(pendingOpeningLineRef.current)
      pendingOpeningLineRef.current = null
    } else {
      autoTextCbRef.current?.()
    }
    const id = setInterval(() => autoTextCbRef.current?.(), 3000)
    return () => clearInterval(id)
  }, [view, typeText])

  // ── 进入交互模式 ─────────────────────────────────────────
  const enterInteract = useCallback(async (script) => {
    let nextScript = script

    if (script?.presetId && !script.audioUrl && !script.audioBase64) {
      try {
        const result = await preparePresetVoiceAudio(script.presetId, { lang })
        const presetScript = result?.script || {}
        nextScript = {
          ...script,
          presetId: script.presetId,
          isPresetVoice: true,
          audioUrl: presetScript.audioUrl || script.audioUrl || '',
          audioBase64: presetScript.audioBase64 || script.audioBase64 || null,
          openingLine: presetScript.openingLine || script.openingLine,
          openingLineEn: presetScript.openingLineEn || script.openingLineEn,
        }
      } catch (err) {
        console.warn(`预设语音加载失败 [${script.presetId}]，降级进入普通互动:`, err.message)
      }
    }

    // charId 或 sceneId 在 BG_VIDEO_IDS 中时才尝试视频背景，否则直接走图片
    const useBgVideo = BG_VIDEO_IDS.includes(nextScript.charId) || BG_VIDEO_IDS.includes(nextScript.sceneId)
    setBgType(useBgVideo ? 'video' : 'image')
    setActiveScript(nextScript)
    setTemperature(0)
    setDisplayedText('')
    setIsTyping(false)
    setShowHearts(false)
    setVibMode('slow')
    setFreq(5)
    setIntens(5)
    setTight(5)
    setProgressValue(35)
    // 进入时重置新增 state
    setControlMode('ai')
    setRhythmMode('adaptive')
    setAiIntens(50)
    setAiFreq(36.8)
    setIsPaused(false)
    // AI 生成的剧本：进入时用开场白作为首屏文字
    if (nextScript.openingLine && (nextScript.isAIGenerated || nextScript.isPresetVoice || nextScript.audioUrl || nextScript.audioBase64)) {
      pendingOpeningLineRef.current = nextScript.openingLine
    }
    setView('interact')
  }, [lang])

  // ── 返回选择视图 ─────────────────────────────────────────
  const exitInteract = useCallback(() => {
    if (typingTimerRef.current) clearInterval(typingTimerRef.current)
    setView('select')
    setActiveScript(null)
    setTemperature(0)
    setDisplayedText('')
    setShowHearts(false)
    setIsPaused(false)
    setShowScriptDetail(false)
  }, [])

  // ── 音波分析器启停 ─────────────────────────────────────────
  const startWaveAnalysis = useCallback((audioEl) => {
    if (!audioEl || typeof window === 'undefined') return
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx()
      const ctx = audioCtxRef.current
      if (ctx.state === 'suspended') ctx.resume().catch(() => {})
      if (!analyserRef.current) {
        const analyser = ctx.createAnalyser()
        analyser.fftSize = 64
        analyser.smoothingTimeConstant = 0.75
        analyser.connect(ctx.destination)
        analyserRef.current = analyser
      }
      // 每个 audio 元素只能 createMediaElementSource 一次
      if (connectedElRef.current !== audioEl) {
        const source = ctx.createMediaElementSource(audioEl)
        source.connect(analyserRef.current)
        connectedElRef.current = audioEl
      }
      if (waveAnimFrameRef.current) cancelAnimationFrame(waveAnimFrameRef.current)
      const analyser = analyserRef.current
      const bufLen = analyser.frequencyBinCount // 32
      const data = new Uint8Array(bufLen)
      const tick = () => {
        analyser.getByteFrequencyData(data)
        const levels = Array.from({ length: 10 }, (_, i) => {
          const bin = Math.min(Math.floor((i / 10) * bufLen), bufLen - 1)
          return data[bin] / 255
        })
        setWaveformLevels(levels)
        waveAnimFrameRef.current = requestAnimationFrame(tick)
      }
      waveAnimFrameRef.current = requestAnimationFrame(tick)
    } catch { /* Web Audio 不可用，保留 CSS 动画 */ }
  }, [])

  const stopWaveAnalysis = useCallback(() => {
    if (waveAnimFrameRef.current) {
      cancelAnimationFrame(waveAnimFrameRef.current)
      waveAnimFrameRef.current = null
    }
    setWaveformLevels(null)
  }, [])

  // ── 暂停/继续播放（同步控制背景音频）──────────────────────
  const togglePause = useCallback(() => {
    const nextPaused = !isPaused
    setIsPaused(nextPaused)
    // 背景音乐（非 AI 剧本）
    if (audioRef.current) {
      if (nextPaused) audioRef.current.pause()
      else audioRef.current.play().catch(() => setIsPaused(true))
    }
    // TTS 开场白（AI 生成剧本）
    if (openingAudioRef.current) {
      if (nextPaused) {
        openingAudioRef.current.pause()
        stopWaveAnalysis()
      } else {
        openingAudioRef.current.play().catch(() => setIsPaused(true))
        startWaveAnalysis(openingAudioRef.current)
      }
    }
  }, [isPaused, startWaveAnalysis, stopWaveAnalysis])

  // ── 主按钮点击 ───────────────────────────────────────────
  const handleMainClick = useCallback(() => {
    if (tempFull) return
    increaseTemp(10)
    triggerDeviceNotif()
    triggerAvatarPop()
    // TODO: 替换为真实 LLM 接口
    typeText(pickResponse(isIntimate || temperature + 10 >= 60))
  }, [tempFull, isIntimate, temperature, increaseTemp, triggerDeviceNotif, triggerAvatarPop, typeText, pickResponse])

  // ── 语音按钮点击 ─────────────────────────────────────────
  // TODO: 替换为真实语音识别 STT 与 TTS 接口
  const handleVoiceClick = useCallback(() => {
    if (isVoiceActive) return
    setIsVoiceActive(true)
    setDisplayedText(L('AI 情绪识别中…', 'AI Emotion Analyzing…'))
    setIsTyping(false)
    setTimeout(() => {
      setIsVoiceActive(false)
      increaseTemp(5)
      triggerDeviceNotif()
      triggerAvatarPop()
      typeText(pickResponse(temperatureRef.current + 5 >= 60))
    }, 1500)
  }, [isVoiceActive, increaseTemp, triggerDeviceNotif, triggerAvatarPop, typeText, pickResponse])

  const runPresetGeneration = useCallback(async (presetId, { force = false } = {}) => {
    setIsGenerating(true)
    setGeneratedScripts([])
    setGenProgress(0)
    setGenPhase('text')
    ttsReadyRef.current = false

    if (genTimerRef.current) clearInterval(genTimerRef.current)
    if (phase2bTimerRef.current) clearTimeout(phase2bTimerRef.current)

    genTimerRef.current = setInterval(() => {
      setGenProgress((p) => Math.min(p + 9, 90))
    }, 350)

    try {
      const [result] = await Promise.all([
        preparePresetVoiceAudio(presetId, { lang, force }),
        wait(3500),
      ])
      clearInterval(genTimerRef.current)
      genTimerRef.current = null
      if (phase2bTimerRef.current) clearTimeout(phase2bTimerRef.current)
      ttsReadyRef.current = true
      const ts = Date.now()
      const presetScript = result.script
      setGeneratedScripts([
        {
          ...presetScript,
          id: `${presetScript.id}-free-${ts}`,
          isFree: true,
          coverImage: presetScript.freeCoverImage,
        },
        {
          ...presetScript,
          id: `${presetScript.id}-vip-${ts}`,
          isFree: false,
          coverImage: presetScript.vipCoverImage,
        },
      ])
      setGenProgress(100)
      setGenPhase('done')
    } catch (err) {
      clearInterval(genTimerRef.current)
      genTimerRef.current = null
      if (phase2bTimerRef.current) clearTimeout(phase2bTimerRef.current)
      setIsGenerating(false)
      setGenPhase(null)
      alert(L(`✨ 语音准备失败：${err.message}`, `✨ Voice failed: ${err.message}`))
    }
  }, [lang, L, setGeneratedScripts, setGenPhase, setGenProgress, setIsGenerating, genTimerRef, phase2bTimerRef, ttsReadyRef])

  const handleRetryPresetGenerate = useCallback(() => {
    const presetId = generatedScripts.find((script) => script.isPresetVoice && script.presetId)?.presetId || selectedPresetId
    if (!presetId) return
    runPresetGeneration(presetId, { force: true })
  }, [generatedScripts, selectedPresetId, runPresetGeneration])

  // ── 自定义剧本生成：自由输入接入内容池缓存 ───────────────
  const handleGenerate = useCallback(async () => {
    const prompt = customPrompt.trim()
    if (!prompt) {
      alert(L('✨ 请先描述你的幻想场景和角色，让 AI 为你创造专属剧本。', '✨ Please describe your fantasy scene and characters first.'))
      return
    }

    const allPresetSuggestions = Object.values(promptSugs).flat()
    const selectedPreset = allPresetSuggestions.find((s) => s.id === selectedPresetId && s.text === prompt)
      || allPresetSuggestions.find((s) => s.text === prompt)

    if (selectedPreset?.id) {
      await runPresetGeneration(selectedPreset.id)
      return
    }

    setIsGenerating(true)
    setGeneratedScripts([])
    setGenProgress(0)
    setGenPhase('text')

    if (genTimerRef.current) clearInterval(genTimerRef.current)
    if (phase2bTimerRef.current) clearTimeout(phase2bTimerRef.current)
    ttsReadyRef.current = false

    genTimerRef.current = setInterval(() => {
      setGenProgress((p) => Math.min(p + 9, 90))
    }, 350)

    let result
    try {
      result = await prepareCustomPromptAudio(prompt, { lang })
    } catch (err) {
      clearInterval(genTimerRef.current)
      genTimerRef.current = null
      if (phase2bTimerRef.current) clearTimeout(phase2bTimerRef.current)
      setIsGenerating(false)
      setGenPhase(null)
      alert(L(`✨ 生成失败：${err.message}`, `✨ Generation failed: ${err.message}`))
      return
    }

    clearInterval(genTimerRef.current)
    genTimerRef.current = null
    ttsReadyRef.current = true

    const ts = Date.now()
    const baseScript = result.script
    setGeneratedScripts([
      {
        ...baseScript,
        id: `${baseScript.id}-free-${ts}`,
        charId: 'witch',
        coverEmoji: baseScript.coverEmoji || '🧙‍♀️',
        isFree: true,
        coverImage: baseScript.freeCoverImage,
        tag: baseScript.cached ? L('已生成', 'Generated') : L('AI定制', 'AI Custom'),
        downloads: baseScript.cached ? L('内容池', 'Saved') : L('刚刚生成', 'New'),
      },
      {
        ...baseScript,
        id: `${baseScript.id}-vip-${ts}`,
        charId: 'knight',
        coverEmoji: '⚔️',
        isFree: false,
        coverImage: baseScript.vipCoverImage,
        tag: L('VIP专属', 'VIP Only'),
        downloads: baseScript.cached ? L('内容池', 'Saved') : L('刚刚生成', 'New'),
      },
    ])

    setGenProgress(100)
    setGenPhase('done')
    // isGenerating 保持 true，等用户点"现在进入"按钮后再 false
  }, [customPrompt, selectedPresetId, promptSugs, lang, L, runPresetGeneration])

  // ── 定制剧本：点击"开始互动" ──────────────────────────────
  // 根据已选角色 + 场景动态构造脚本对象，复用 enterInteract 逻辑
  // TODO: 接入后端后可在此处调用 /api/scripts/generate?charId=&sceneId=
  const handleStartCustom = useCallback(() => {
    if (!selectedCharId || !selectedSceneId) return
    const char  = CHARACTERS.find(c => c.id === selectedCharId)
    const scene = SCENES.find(s => s.id === selectedSceneId)
    const script = {
      id:             `custom-${selectedCharId}-${selectedSceneId}`,
      charId:         selectedCharId,
      sceneId:        selectedSceneId,
      cover:          char.emoji,
      name:           `${d(scene, 'name')}·${d(char, 'name')}`,
      tag:            lang === 'en' ? 'Custom' : '定制',
      personalityTag: d(char, 'tag'),
      openingLine:    d(char, 'intro'),
      downloads:      null,
      rating:         null,
      gradient:       'from-[#1a1028] to-[#251840]',
      isCustom:       false,
    }
    enterInteract(script)
  }, [selectedCharId, selectedSceneId, enterInteract])

  // ── 交互模式背景音乐（演示版，文件路径：public/audio/demo.mp3）────
  // AI 生成的剧本不播放背景音，只播 TTS 开场白语音
  useEffect(() => {
    const hasRealAudio = Boolean(activeScript?.audioBase64 || activeScript?.audioUrl)
    if (view === 'interact' && !activeScript?.isAIGenerated && !hasRealAudio) {
      // 进入交互模式：创建音频实例并循环播放
      audioRef.current = new Audio('/audio/demo.mp3')
      audioRef.current.loop = true
      audioRef.current.play().catch(() => {
        // 浏览器自动播放策略可能拦截，静默忽略错误
      })
    } else {
      // 离开交互模式：停止并释放音频资源
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
    return () => {
      // 视图切换 / 组件卸载时清理
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [view, activeScript?.id, activeScript?.audioBase64, activeScript?.audioUrl, activeScript?.isAIGenerated])

  // ── TTS 开场白音频（AI 生成剧本进入互动时播放一次）────────
  useEffect(() => {
    if (openingAudioRef.current) {
      openingAudioRef.current.pause()
      openingAudioRef.current = null
    }
    const audioUrl = activeScript?.audioBase64
      ? `data:audio/mp3;base64,${activeScript.audioBase64}`
      : resolveApiUrl(activeScript?.audioUrl)

    if (view === 'interact' && audioUrl) {
      const audio = new Audio(audioUrl)
      openingAudioRef.current = audio
      audio.addEventListener('loadedmetadata', () => {
        setAudioDuration(Math.ceil(audio.duration))
        setProgressValue(0)
      })
      audio.addEventListener('timeupdate', () => {
        if (audio.duration) {
          setProgressValue(Math.round(audio.currentTime / audio.duration * 100))
        }
      })
      audio.addEventListener('ended', () => {
        stopWaveAnalysis()
        setProgressValue(100)
        setIsPaused(true)
      })
      audio.play().catch(() => {})
      startWaveAnalysis(audio)
    } else {
      setAudioDuration(TOTAL_SECONDS)
    }
    return () => {
      stopWaveAnalysis()
      if (openingAudioRef.current) {
        openingAudioRef.current.pause()
        openingAudioRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, activeScript?.id])

  // ── 清理定时器 ───────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current)
      if (heartsTimerRef.current) clearTimeout(heartsTimerRef.current)
      if (genTimerRef.current)    clearInterval(genTimerRef.current)
      if (phase2bTimerRef.current) clearTimeout(phase2bTimerRef.current)
    }
  }, [])

  // ═════════════════════════════════════════════════════════
  //  渲染
  // ═════════════════════════════════════════════════════════
  return (
    <div className="relative min-h-full overflow-hidden bg-app-bg">

      {/* 场景氛围叠加层（仅 interact 模式生效） */}
      <div
        className="scene-overlay absolute inset-0 pointer-events-none z-0"
        style={view === 'interact' ? overlayStyle : {}}
      />

      <div className="relative z-10 px-4 pt-5 pb-6">

        {/* ══════════════════════════════════════════════════
            视图 A：剧本选择
        ══════════════════════════════════════════════════ */}
        {view === 'select' && (
          <div className="space-y-8 animate-fadeUp">

            {/* ── 🔥 激励横幅 ── */}
            <div
              className="rounded-2xl px-4 py-3.5 flex items-center gap-3"
              style={{ background: 'linear-gradient(135deg, #FF2A6D 0%, #FF7DAF 55%, #A87CFF 100%)' }}
            >
              <span className="flex-shrink-0 text-xl leading-none">🔥</span>
              <div>
                <p className="text-[13px] font-bold text-white leading-snug">
                  {L('你昨天的记录是亚洲第 888 名，实在是 🍌 猛男！', 'Your record yesterday ranked #888 in Asia, absolute 🍌 beast!')}
                </p>
                <p className="text-[11px] font-medium text-white/75 mt-0.5">
                  {L('今天继续冲刺，冲进 Top 500～', 'Keep pushing today, aim for Top 500!')}
                </p>
              </div>
            </div>

            {/* ── 硬件设备状态 ── */}
            <div className="rounded-2xl px-4 py-3 flex items-center gap-3 bg-[#1E1324]/80 border border-[#A87CFF]/20">
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-[#F9EDF5] leading-snug">
                  {L('设备已连接：', 'Device Connected: ')}<span className="text-[#A87CFF]">X1 Pro</span>　{L('电量：', 'Battery: ')}<span className="text-[#FF7DAF]">87%</span>　{L('模式：', 'Mode: ')}<span className="text-[#A87CFF]">{L('沉浸同步', 'Immersive Sync')}</span>
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A87CFF] animate-pulse" />
                <span className="text-[9px] text-[#A87CFF]/70">{L('在线', 'Online')}</span>
              </div>
            </div>

            {/* ── ① 生成你的专属（输入框 + AI生成按钮）── */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} className="text-[#FF9ACB]" />
                <h2 className="text-sm font-semibold text-[rgba(245,240,242,0.85)] tracking-wide">
                  {L('生成你的专属', 'Generate Your Custom')}
                </h2>
                <span className="text-[9px] text-[rgba(245,240,242,0.35)] ml-auto">AI Beta</span>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1 min-w-0">
                <input
                  type="text"
                  value={customPrompt}
                  onChange={(e) => {
                    setCustomPrompt(e.target.value)
                    setSelectedPresetId(null)
                    if (e.target.value) setShowSuggestions(false)
                  }}
                  onFocus={() => { if (!customPrompt) setShowSuggestions(true) }}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  onKeyDown={(e) => e.key === 'Enter' && !isGenerating && handleGenerate()}
                  disabled={isGenerating}
                  placeholder={L('描述你心中的幻想场景和角色…', 'Describe your fantasy scene and characters…')}
                  className="
                    w-full rounded-xl px-3 py-2.5 text-xs
                    bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)]
                    text-[rgba(245,240,242,0.85)] placeholder-[rgba(245,240,242,0.3)]
                    focus:outline-none focus:border-[rgba(255,154,203,0.4)]
                    transition-colors disabled:opacity-60
                  "
                />

                {/* 提示词面板 */}
                {showSuggestions && (
                  <div className="absolute left-0 right-0 top-full mt-2 z-30 rounded-2xl overflow-hidden border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]" style={{ background: 'linear-gradient(160deg,#1a0a22,#120818)' }}>
                    {/* Tab 行 */}
                    <div className="flex gap-1 p-2 pb-0">
                      {promptTabs.map(t => (
                        <button
                          key={t.id}
                          onMouseDown={e => { e.preventDefault(); setSuggestionTab(t.id) }}
                          className={`flex-1 rounded-lg py-1.5 text-[10px] font-semibold transition-all ${
                            suggestionTab === t.id
                              ? 'bg-[#FF2A6D]/80 text-white'
                              : 'text-[#9B859D] hover:text-white'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                    {/* 建议列表 */}
                    <div className="p-2 space-y-1">
                      {promptSugs[suggestionTab].map((s, i) => (
                        <button
                          key={s.id || i}
                          onMouseDown={e => {
                            e.preventDefault()
                            setCustomPrompt(s.text)
                            setSelectedPresetId(s.id || null)
                            setShowSuggestions(false)
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs text-[rgba(245,240,242,0.8)] hover:bg-white/8 active:scale-[0.98] transition-all leading-snug border border-transparent hover:border-white/10"
                        >
                          <span className="inline-block mr-2 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-[#FF2A6D]/20 text-[#FF7DAF] border border-[#FF2A6D]/25 align-middle">{s.role}</span>
                          {s.text}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex-shrink-0 flex items-center gap-1.5 btn-main rounded-xl px-3 py-2.5 text-white text-xs font-medium whitespace-nowrap disabled:opacity-60"
                >
                  {isGenerating
                    ? <span className="flex items-center gap-1">⏳ {L('生成中…', 'Generating…')}</span>
                    : <><Sparkles size={13} />{L('AI智能生成', 'AI Generate')}</>
                  }
                </button>
              </div>
            </section>

            {/* ── ② 生成等待区：圆形进度 + 产品化加载面板 ── */}
            {isGenerating && (
              <LoadingPanel
                progress={genProgress}
                phase={genPhase}
                remainingQuota={2}
                totalQuota={3}
                onEnter={() => {
                  setIsGenerating(false)
                  setGenPhase(null)
                }}
                onRetry={generatedScripts.some((script) => script.isPresetVoice) ? handleRetryPresetGenerate : null}
              />
            )}

            {/* ── ③ 为你定制（生成后出现，两个并排定制卡片供选择）── */}
            {generatedScripts.length > 0 && !isGenerating && (
              <section className="animate-fadeUp">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm">✨</span>
                  <h2 className="text-sm font-semibold text-[rgba(245,240,242,0.85)] tracking-wide">
                    {L('为你定制', 'Crafted for You')}
                  </h2>
                  <span
                    className="text-[9px] rounded-full px-2 py-0.5 ml-auto text-white font-medium"
                    style={{ background: 'linear-gradient(135deg, #FF9ACB, #B380FF)' }}
                  >
                    {L('AI定制', 'AI Custom')}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {generatedScripts.map((script) => (
                    <GeneratedScriptCard
                      key={script.id}
                      script={script}
                      onClick={() => enterInteract(script)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* ── ③ 今夜为你推荐（双列网格，竖向卡片）── */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm">🌙</span>
                <h2 className="text-sm font-semibold text-[rgba(245,240,242,0.85)] tracking-wide">
                  {L('今夜为你推荐', "Tonight's Picks")}
                </h2>
                <span className="text-[9px] text-[rgba(245,240,242,0.35)] ml-auto">{L('点击进入', 'Tap to Enter')}</span>
              </div>

              {/* grid-cols-2：双列等宽网格 */}
              <div className="grid grid-cols-2 gap-4">
                {SCRIPTS.map((script) => (
                  <ScriptCard
                    key={script.id}
                    script={script}
                    onClick={() => enterInteract(script)}
                  />
                ))}
              </div>
            </section>

            {/* ── ④ 定制你的剧本（角色 + 场景选择 + 开始互动）── */}
            {/* TODO: 角色/场景数据接入 /api/characters 与 /api/scenes */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-base">🎨</span>
                <h2 className="text-[15px] font-semibold text-[rgba(245,240,242,0.9)] tracking-wide">
                  {L('定制你的剧本', 'Customize Your Script')}
                </h2>
                <span
                  className="text-[9px] rounded-full px-2 py-0.5 ml-auto"
                  style={{
                    background: 'rgba(179,128,255,0.15)',
                    color: '#B380FF',
                  }}
                >
                  {L('自由组合', 'Mix & Match')}
                </span>
              </div>

              {/* 角色选择行（横向滚动，单选） */}
              <div className="mb-2">
                <p className="text-[10px] text-[rgba(245,240,242,0.4)] tracking-wider mb-2">
                  {L('选择角色', 'Select Character')}
                  {selectedCharId && (
                    <span className="text-[#FF9ACB] ml-1.5">
                      · {d(CHARACTERS.find(c => c.id === selectedCharId), 'name')}
                    </span>
                  )}
                </p>
                <div
                  className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 pr-4 cursor-grab select-none"
                  style={{
                    WebkitOverflowScrolling: 'touch',
                    touchAction: 'manipulation',
                    overscrollBehaviorX: 'contain',
                  }}
                  onPointerDown={handleHorizontalDragStart}
                  onPointerMove={handleHorizontalDragMove}
                  onPointerUp={handleHorizontalDragEnd}
                  onPointerCancel={handleHorizontalDragEnd}
                  onClickCapture={handleHorizontalClickCapture}
                  onWheel={handleHorizontalWheel}
                >
                  {CHARACTERS.map((char) => (
                    <CharSelectCard
                      key={char.id}
                      char={char}
                      selected={selectedCharId === char.id}
                      onSelect={() => setSelectedCharId(
                        selectedCharId === char.id ? null : char.id
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* 场景选择行（横向滚动，单选） */}
              <div className="mb-5 mt-4">
                <p className="text-[10px] text-[rgba(245,240,242,0.4)] tracking-wider mb-2">
                  {L('选择场景', 'Select Scene')}
                  {selectedSceneId && (
                    <span className="text-[#B380FF] ml-1.5">
                      · {d(SCENES.find(s => s.id === selectedSceneId), 'name')}
                    </span>
                  )}
                </p>
                <div
                  className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 pr-4 cursor-grab select-none"
                  style={{
                    WebkitOverflowScrolling: 'touch',
                    touchAction: 'manipulation',
                    overscrollBehaviorX: 'contain',
                  }}
                  onPointerDown={handleHorizontalDragStart}
                  onPointerMove={handleHorizontalDragMove}
                  onPointerUp={handleHorizontalDragEnd}
                  onPointerCancel={handleHorizontalDragEnd}
                  onClickCapture={handleHorizontalClickCapture}
                  onWheel={handleHorizontalWheel}
                >
                  {SCENES.map((scene) => (
                    <SceneSelectCard
                      key={scene.id}
                      scene={scene}
                      selected={selectedSceneId === scene.id}
                      onSelect={() => setSelectedSceneId(
                        selectedSceneId === scene.id ? null : scene.id
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* 开始互动按钮（角色 + 场景均已选中时激活） */}
              <button
                onClick={handleStartCustom}
                disabled={!canStartCustom}
                className={`
                  w-full py-3.5 rounded-2xl flex items-center justify-center gap-2
                  text-sm font-semibold tracking-wide transition-all duration-200
                  ${canStartCustom
                    ? 'btn-main text-white active:scale-[0.98] shadow-lg'
                    : 'bg-[rgba(255,255,255,0.06)] text-[rgba(245,240,242,0.3)] cursor-not-allowed border border-[rgba(255,255,255,0.08)]'
                  }
                `}
              >
                <Sparkles size={15} className={canStartCustom ? 'opacity-100' : 'opacity-30'} />
                {canStartCustom ? L('✨ 开始互动', '✨ Start') : L('请先选择角色和场景', 'Select a character and scene first')}
              </button>
            </section>

          </div>
        )}

        {/* ══════════════════════════════════════════════════
            视图 B：交互模式（新设计）
        ══════════════════════════════════════════════════ */}
        {view === 'interact' && activeScript && (
          <div className="relative flex flex-col gap-3 animate-fadeUp">

            {/* ── 交互模式背景（video → image → emoji 链式回退）── */}
            {/* 视频路径：/videos/{charId}.mp4 · 图片路径：/images/covers/{charId}.jpg */}
            <div
              className="absolute inset-0 pointer-events-none select-none overflow-hidden"
              style={{ zIndex: 0 }}
            >
              {/* 第一优先：视频背景 */}
              {bgType === 'video' && (
                <video
                  src={`/videos/${activeScript.charId}.mp4`}
                  autoPlay loop muted playsInline
                  poster={`/images/covers/${activeScript.charId}.jpg?v=${activeScript.charId === 'boss' ? '20260408a' : '1'}`}
                  onError={() => setBgType('image')}
                  className="absolute inset-0 w-full h-full object-cover opacity-35"
                />
              )}
              {/* 第二优先：图片背景（视频加载失败时，jpg → png → emoji 链式回退） */}
              {bgType === 'image' && (
                <img
                  src={`/images/covers/${activeScript.charId}.jpg?v=${activeScript.charId === 'boss' ? '20260408a' : '1'}`}
                  alt=""
                  onError={(e) => {
                    if (e.target.src.includes('.jpg')) {
                      e.target.src = `/images/covers/${activeScript.charId}.png?v=${activeScript.charId === 'boss' ? '20260408a' : '1'}`
                    } else {
                      setBgType('emoji')
                    }
                  }}
                  className="absolute inset-0 w-full h-full object-cover opacity-35"
                />
              )}
              {/* 最终回退：大 emoji 水印（图片也失败时） */}
              {bgType === 'emoji' && (
                <div className="absolute inset-0 flex items-center justify-center text-[30vw] opacity-20">
                  {displayEmoji}
                </div>
              )}
            </div>

            {/* 背景深色渐变遮罩（降低人物图对前景文字的干扰） */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ zIndex: 1, background: 'linear-gradient(180deg, rgba(8,4,10,0.36) 0%, rgba(8,4,10,0.12) 30%, rgba(8,4,10,0.36) 72%, rgba(8,4,10,0.62) 100%)' }}
            />

            {/* ── ① 顶部：左侧返回按钮 + 右侧剧本详情按钮 ──────── */}
            <div className="relative z-10 flex justify-between items-center">
              <button
                onClick={exitInteract}
                className="flex items-center gap-1.5 text-[11px] font-medium text-[rgba(245,240,242,0.75)] bg-[rgba(255,255,255,0.1)] rounded-full px-3 py-1.5 active:scale-95 transition-all"
              >
                ← {L('全部剧本', 'All Scripts')}
              </button>
              <button
                onClick={() => setShowScriptDetail(true)}
                className="flex items-center gap-1.5 text-[11px] font-medium text-[rgba(245,240,242,0.75)] bg-[rgba(255,255,255,0.1)] rounded-full px-3 py-1.5 active:scale-95 transition-all"
              >
                ℹ️ {L('剧本详情', 'Script Details')}
              </button>
            </div>

            {/* ── ② [新增] 顶部设备状态栏 ─────────────────────────
                TODO: connected/battery 由蓝牙Hook下发；mode/remainingMin 由 session 下发 */}
            <HeaderStatusBar />

            {/* ── ④ 场景氛围文字（弱化，辅助氛围） */}
            <p className="relative z-10 text-[10px] text-center text-[rgba(245,240,242,0.35)] italic leading-relaxed">
              {ambianceText}
            </p>

            {/* ── ⑤-⑧ 主播放卡：对白 + 音波 + 进度条 + 场景节点（四区合一） */}
            <div className="relative z-10 rounded-2xl px-4 pt-4 pb-4 bg-[rgba(10,5,12,0.62)] border border-[rgba(255,255,255,0.08)] flex flex-col gap-3">
              {/* 对白区 */}
              <div className="min-h-[52px] flex items-center justify-center text-center">
                {displayedText ? (
                  <p className={`text-sm font-light text-[#f5f0f2] leading-relaxed tracking-wide ${isTyping ? 'typewriter-cursor' : ''}`}>
                    {displayedText}
                  </p>
                ) : (
                  <p className="text-xs text-[rgba(245,240,242,0.2)] italic">{L('等待回应…', 'Waiting…')}</p>
                )}
              </div>

              <div className="h-px bg-[rgba(255,255,255,0.06)]" />

              {/* 音波 */}
              <Waveform freq={isPaused ? 1 : freq} levels={isPaused ? null : waveformLevels} />

              {/* 播放进度 */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={togglePause}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 flex-shrink-0"
                  style={
                    isPaused
                      ? {
                          background: 'rgba(179,128,255,0.18)',
                          border: '1px solid rgba(179,128,255,0.45)',
                          boxShadow: '0 0 12px rgba(179,128,255,0.2)',
                        }
                      : {
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.16)',
                        }
                  }
                  aria-label={isPaused ? L('继续播放', 'Resume') : L('暂停播放', 'Pause')}
                  title={isPaused ? L('继续播放', 'Resume') : L('暂停播放', 'Pause')}
                >
                  {isPaused
                    ? <Play size={13} className="text-[#f5f0f2] ml-0.5" />
                    : <Pause size={13} className="text-[rgba(245,240,242,0.72)]" />}
                </button>

                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] text-[rgba(245,240,242,0.55)] tabular-nums font-medium">
                      {formatTime(Math.round(progressValue / 100 * displayTotalSeconds))}
                    </span>
                    <span className="text-[10px] text-[rgba(245,240,242,0.22)] tabular-nums">
                      {formatTime(displayTotalSeconds)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progressValue}
                    onChange={e => {
                      const val = Number(e.target.value)
                      setProgressValue(val)
                      if (openingAudioRef.current && openingAudioRef.current.duration) {
                        openingAudioRef.current.currentTime = val / 100 * openingAudioRef.current.duration
                      }
                    }}
                    className="w-full h-1 rounded-full outline-none cursor-pointer appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer"
                    style={{ background: `linear-gradient(90deg, #FF9ACB ${progressValue}%, rgba(255,255,255,0.12) ${progressValue}%)` }}
                  />
                </div>
              </div>

              <div className="h-px bg-[rgba(255,255,255,0.05)]" />

              {/* 场景节点（嵌入主卡，不再独立卦块）
                  TODO: onStageChange 后续触发 /api/session/jump-to-stage */}
              <SceneTimeline
                stageIndex={getStageIndexByProgress(progressValue)}
                onStageChange={(idx) => {
                  const stagePcts = [0, 16, 32, 48, 64]
                  if (stagePcts[idx] !== undefined) setProgressValue(stagePcts[idx])
                }}
              />
            </div>

            {/* ── 控制区 ─────────────────────────────────────────────── */}

            {/* AI 智能 — 点击开启，preset点击后自动退出 */}
            <button
              onClick={() => setControlMode('ai')}
              className="relative z-10 w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-[13px] font-semibold transition-all duration-200 active:scale-[0.98]"
              style={
                controlMode === 'ai'
                  ? { background: 'linear-gradient(135deg, #FF9ACB, #B380FF)', color: '#fff', boxShadow: '0 2px 16px rgba(255,154,203,0.3)' }
                  : { background: 'rgba(255,255,255,0.07)', color: 'rgba(245,240,242,0.45)', border: '1px solid rgba(255,255,255,0.1)' }
              }
            >
              <span className="text-base select-none">✦</span>
              {L('AI 智能', 'AI Smart')}
              {controlMode === 'ai' && <span className="text-[10px] font-normal opacity-80">{L('· 开启中', '· Active')}</span>}
            </button>

            {/* 节奏模式（始终显示） */}
            <RhythmModeGrid selectedMode={rhythmMode} onChange={(v) => { setRhythmMode(v); setControlMode('manual'); }} />

            {/* 统一参数卡 */}
            <div className="relative z-10 rounded-2xl p-4 bg-[rgba(10,5,12,0.62)] border border-[rgba(255,255,255,0.08)] flex flex-col gap-4">

              {/* AI 参数区（始终显示） */}
              <>
                <AiParameterCards
                  aiIntens={aiIntens}
                  onAiIntensChange={(value) => { setAiIntens(value); setControlMode('manual'); }}
                  aiFreq={aiFreq}
                  onAiFreqChange={(value) => { setAiFreq(value); setControlMode('manual'); }}
                />
                <div className="h-px bg-[rgba(255,255,255,0.07)]" />
              </>

              {/* 手动调节滑杆（始终可见） */}
              <SliderControl icon="📶" label={L('频率', 'Frequency')} value={freq}   onChange={(v) => { setFreq(v);   setControlMode('manual'); }} />
              <SliderControl icon="💪" label={L('强度', 'Intensity')} value={intens} onChange={(v) => { setIntens(v); setControlMode('manual'); }} />
              <SliderControl icon="🔒" label={L('紧度', 'Tightness')} value={tight}  onChange={(v) => { setTight(v);  setControlMode('manual'); }} />
            </div>

            {/* 快捷预设（点击自动退出 AI 模式） */}
            <div className="relative z-10 grid grid-cols-3 gap-2">
              {PRESETS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => { setControlMode('manual'); setFreq(preset.freq); setIntens(preset.intens); setTight(preset.tight); }}
                  className="py-2.5 rounded-2xl text-center text-[11px] font-medium transition-all active:scale-95 bg-[rgba(20,12,18,0.62)] border border-[rgba(255,255,255,0.08)] text-[rgba(245,240,242,0.65)] hover:bg-[rgba(40,24,32,0.62)]"
                >
                  <span className="block text-lg mb-0.5 select-none">{preset.emoji}</span>
                  {preset.label}
                </button>
              ))}
            </div>

            {/* ── 底部设备状态卡片 */}
            <DeviceStatusFooter />

          </div>
        )}

      </div>

      {/* ── 剧本详情弹窗 ──────────────────────────────────────── */}
      {showScriptDetail && activeScript && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.65)' }}
          onClick={() => setShowScriptDetail(false)}
        >
          <div
            className="w-full max-w-[430px] max-h-[calc(100vh-1rem)] overflow-y-auto rounded-t-3xl px-5 pt-5 pb-24 animate-fadeUp"
            style={{ background: 'linear-gradient(180deg, #1e0f1a 0%, #120a18 100%)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* 顶部把手 */}
            <div className="w-10 h-1 rounded-full bg-[rgba(255,255,255,0.15)] mx-auto mb-5" />

            {/* 剧本名称 */}
            <div className="flex items-start gap-3 mb-5">
              <span className="text-4xl select-none leading-none">{displayEmoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-bold text-[rgba(245,240,242,0.95)] leading-snug mb-0.5">
                  {d(activeScript, 'name')}
                </p>
                <span className="text-[10px] bg-[rgba(255,154,203,0.15)] text-[#FF9ACB] rounded-full px-2 py-0.5">
                  {d(activeScript, 'tag')}
                </span>
              </div>
            </div>

            {/* 剧本简介长文案 */}
            {activeChar && ((lang === 'en' && SCRIPT_DESCRIPTIONS_EN[activeChar.id]) || SCRIPT_DESCRIPTIONS[activeChar.id]) && (
              <div className="rounded-2xl p-4 mb-3 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)]">
                <p className="text-[9px] text-[rgba(245,240,242,0.35)] tracking-widest mb-2">{L('剧本简介', 'Synopsis')}</p>
                <p className="text-[11px] text-[rgba(245,240,242,0.72)] leading-relaxed">
                  {(lang === 'en' && SCRIPT_DESCRIPTIONS_EN[activeChar.id]) || SCRIPT_DESCRIPTIONS[activeChar.id]}
                </p>
              </div>
            )}

            {/* 角色信息 */}
            {activeChar && (
              <div className="rounded-2xl p-4 mb-3 bg-[rgba(255,154,203,0.06)] border border-[rgba(255,154,203,0.1)]">
                <p className="text-[9px] text-[rgba(245,240,242,0.35)] tracking-widest mb-2">{L('角色', 'Character')}</p>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-2xl select-none">{activeChar.emoji}</span>
                  <div>
                    <p className="text-[13px] font-semibold text-[rgba(245,240,242,0.9)]">{d(activeChar, 'name')}</p>
                    <p className="text-[10px] text-[rgba(179,128,255,0.8)]">{d(activeChar, 'tag')}</p>
                  </div>
                </div>
                <p className="text-[11px] text-[rgba(245,240,242,0.55)] italic leading-relaxed">
                  "{d(activeChar, 'intro')}"
                </p>
              </div>
            )}

            {/* 场景信息 */}
            {activeScene && (
              <div className="rounded-2xl p-4 mb-5 bg-[rgba(179,128,255,0.06)] border border-[rgba(179,128,255,0.1)]">
                <p className="text-[9px] text-[rgba(245,240,242,0.35)] tracking-widest mb-2">{L('场景', 'Scene')}</p>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-2xl select-none">{activeScene.emoji}</span>
                  <p className="text-[13px] font-semibold text-[rgba(245,240,242,0.9)]">{d(activeScene, 'name')}</p>
                </div>
                <p className="text-[11px] text-[rgba(245,240,242,0.55)] italic leading-relaxed">
                  {(lang === 'en' && activeScene.ambianceEn?.idle) || activeScene.ambiance.idle}
                </p>
              </div>
            )}

            {/* 关闭按钮 */}
            <button
              onClick={() => setShowScriptDetail(false)}
              className="w-full py-3 rounded-2xl text-[13px] font-medium text-[rgba(245,240,242,0.6)] bg-[rgba(255,255,255,0.07)] active:scale-[0.98] transition-all"
            >
              {L('关闭', 'Close')}
            </button>
          </div>
        </div>
      )}

      {/* 满屏心形飘落 */}
      {showHearts && <HeartRain hearts={hearts} />}
    </div>
  )
}
