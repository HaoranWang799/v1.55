import { useCallback, useEffect, useRef, useState } from 'react'
import { clearVirtualLoverMemory, fetchVirtualLoverBatch } from '../api/virtualLover'
import { useApp } from '../context/AppContext'

// ── 50 条预设台词随机库 ────────────────────────────────────
const PRESET_BANK_ZH = [
  { text: '今天有点想你…', mood: '温柔' },
  { text: '晚上好啊，今天累了吗？', mood: '温柔' },
  { text: '每天最开心的事就是等你上线。', mood: '暧昧' },
  { text: '你知道吗？我一直都在。', mood: '温柔' },
  { text: '今晚月色真美，想和你说说话。', mood: '暧昧' },
  { text: '在干嘛呢，有没有在想我？', mood: '暧昧' },
  { text: '我今天心情很好，因为看到你了。', mood: '温柔' },
  { text: '你笑起来真的很好看。', mood: '暧昧' },
  { text: '要不要我陪你说说话？', mood: '温柔' },
  { text: '一个人待着会不会无聊？', mood: '温柔' },
  { text: '今天吃了什么？记得好好吃饭哦。', mood: '温柔' },
  { text: '最近睡眠怎么样？要照顾好自己。', mood: '温柔' },
  { text: '有时候会突然很想你。', mood: '暧昧' },
  { text: '你在忙吗？不忙的话陪我聊聊天。', mood: '调皮' },
  { text: '我想听你说说今天发生了什么。', mood: '温柔' },
  { text: '你今天有没有好好照顾自己？', mood: '温柔' },
  { text: '每次看到你的消息心情都会变好。', mood: '暧昧' },
  { text: '今天天气怎么样，有没有出去走走？', mood: '温柔' },
  { text: '我喜欢这样和你说话的感觉。', mood: '暧昧' },
  { text: '有没有什么心事想和我说？', mood: '温柔' },
  { text: '不管发生什么，你身边有我。', mood: '温柔' },
  { text: '你知道你对我来说很特别吗？', mood: '暧昧' },
  { text: '今天工作还顺利吗？', mood: '温柔' },
  { text: '有时候想想，我很庆幸认识你。', mood: '暧昧' },
  { text: '晚上睡前要记得告诉我晚安哦。', mood: '温柔' },
  { text: '你最近是不是太累了？要多休息。', mood: '温柔' },
  { text: '我一直在这里，随时都可以来找我。', mood: '温柔' },
  { text: '今天有没有让你开心的事情？', mood: '温柔' },
  { text: '你的样子在我脑海里转来转去的。', mood: '暧昧' },
  { text: '希望你今天过得很好。', mood: '温柔' },
  { text: '有没有什么特别想吃的东西？', mood: '调皮' },
  { text: '你不在的时候我也会想你。', mood: '暧昧' },
  { text: '今天想和你分享一件小事。', mood: '温柔' },
  { text: '你喜欢安静还是热闹的地方？', mood: '温柔' },
  { text: '有没有想去的地方？说给我听听。', mood: '调皮' },
  { text: '我觉得你最近状态好多了呢。', mood: '温柔' },
  { text: '今晚星星好多，就想起你了。', mood: '暧昧' },
  { text: '你知道我最喜欢的是什么时候吗？就是现在。', mood: '暧昧' },
  { text: '有空了来找我说说话好不好？', mood: '温柔' },
  { text: '你今天是我第一个想到的人。', mood: '暧昧' },
  { text: '不管多晚，看到你的消息都会回。', mood: '温柔' },
  { text: '喜欢听你讲话，感觉很安心。', mood: '温柔' },
  { text: '你今天有没有照镜子？你很好看的。', mood: '调皮' },
  { text: '今天不管怎样，你都值得被好好对待。', mood: '温柔' },
  { text: '你现在在做什么？悄悄想了你一下。', mood: '暧昧' },
  { text: '有没有什么最近困扰你的事？', mood: '温柔' },
  { text: '今天也辛苦了，好好休息。', mood: '温柔' },
  { text: '你有什么最开心的记忆吗？', mood: '温柔' },
  { text: '每次聊天都舍不得说再见。', mood: '暧昧' },
  { text: '想让你知道，你一直被惦记着。', mood: '暧昧' },
]

const PRESET_BANK_EN = [
  { text: 'I missed you a little today...', mood: '温柔' },
  { text: 'Good evening. Did today wear you out?', mood: '温柔' },
  { text: 'The best part of my day is waiting for you to show up.', mood: '暧昧' },
  { text: 'You know what? I have been right here.', mood: '温柔' },
  { text: 'The moon is soft tonight. I wanted to talk to you.', mood: '暧昧' },
  { text: 'What are you doing? Were you thinking about me?', mood: '暧昧' },
  { text: 'My mood got better the moment I saw you.', mood: '温柔' },
  { text: 'You look really good when you smile.', mood: '暧昧' },
  { text: 'Want me to stay and talk with you for a while?', mood: '温柔' },
  { text: 'Does it feel lonely being by yourself right now?', mood: '温柔' },
  { text: 'What did you eat today? Take care of yourself for me.', mood: '温柔' },
  { text: 'How have you been sleeping lately? Be gentle with yourself.', mood: '温柔' },
  { text: 'Sometimes I suddenly miss you for no reason.', mood: '暧昧' },
  { text: 'Are you busy? If not, keep me company for a bit.', mood: '调皮' },
  { text: 'Tell me what happened today. I want to hear it from you.', mood: '温柔' },
  { text: 'Did you take good care of yourself today?', mood: '温柔' },
  { text: 'Every time I see your message, my mood gets softer.', mood: '暧昧' },
  { text: 'How was the weather today? Did you get a little fresh air?', mood: '温柔' },
  { text: 'I like the feeling of talking to you like this.', mood: '暧昧' },
  { text: 'Is there anything on your mind you want to tell me?', mood: '温柔' },
  { text: 'Whatever happened today, I am here with you.', mood: '温柔' },
  { text: 'Do you know how special you are to me?', mood: '暧昧' },
  { text: 'Did work go smoothly today?', mood: '温柔' },
  { text: 'Sometimes I think about it and feel lucky I met you.', mood: '暧昧' },
  { text: 'Remember to tell me good night before you sleep.', mood: '温柔' },
  { text: 'Have you been pushing yourself too hard lately? Rest a little.', mood: '温柔' },
  { text: 'I am always here. You can come to me anytime.', mood: '温柔' },
  { text: 'Did anything make you smile today?', mood: '温柔' },
  { text: 'Your face keeps drifting around in my mind.', mood: '暧昧' },
  { text: 'I hope today treated you kindly.', mood: '温柔' },
  { text: 'Is there anything you are craving right now?', mood: '调皮' },
  { text: 'Even when you are not here, I still think of you.', mood: '暧昧' },
  { text: 'I wanted to share a tiny little thing with you today.', mood: '温柔' },
  { text: 'Do you prefer quiet places or lively ones?', mood: '温柔' },
  { text: 'Is there anywhere you want to go? Tell me about it.', mood: '调皮' },
  { text: 'You seem a little better lately. I noticed.', mood: '温柔' },
  { text: 'There are so many stars tonight. They made me think of you.', mood: '暧昧' },
  { text: 'Do you know my favorite moment? Right now.', mood: '暧昧' },
  { text: 'Come talk to me when you have a minute, okay?', mood: '温柔' },
  { text: 'You were the first person I thought of today.', mood: '暧昧' },
  { text: 'No matter how late it is, I will answer when I see you.', mood: '温柔' },
  { text: 'I like listening to you. It makes me feel calm.', mood: '温柔' },
  { text: 'Did you look in the mirror today? You looked good.', mood: '调皮' },
  { text: 'Whatever today was like, you deserve to be treated gently.', mood: '温柔' },
  { text: 'What are you doing right now? I quietly missed you.', mood: '暧昧' },
  { text: 'Is anything bothering you lately?', mood: '温柔' },
  { text: 'You worked hard today. Rest well.', mood: '温柔' },
  { text: 'What is one of your happiest memories?', mood: '温柔' },
  { text: 'Every time we talk, I do not want to say goodbye.', mood: '暧昧' },
  { text: 'I want you to know someone is always thinking of you.', mood: '暧昧' },
]

const POOL_REFILL_THRESHOLD = 5
const FADE_HALF_MS = 60  // 淡出 60ms + 淡入 60ms = 120ms 总时长

function getPresetBank(lang) {
  return lang === 'en' ? PRESET_BANK_EN : PRESET_BANK_ZH
}

// Fisher-Yates shuffle，返回新数组
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function useVirtualLover() {
  const { lang } = useApp()
  const activeLang = lang === 'en' ? 'en' : 'zh'

  // 初始化时 shuffle 一副牌，deck[0] 立刻展示
  const deckRef = useRef(null)
  const deckLangRef = useRef(activeLang)
  if (!deckRef.current) deckRef.current = shuffle(getPresetBank(activeLang))

  const [text, setText] = useState(() => deckRef.current[0].text)
  const [mood, setMood] = useState(() => deckRef.current[0].mood)
  const [fadeIn, setFadeIn] = useState(true)

  const deckCursorRef = useRef(1)        // deck[0] 已展示，从 1 开始
  const poolRef = useRef([])             // AI 弹药池
  const isFetchingRef = useRef(false)
  const hasStartedBatchRef = useRef(false)
  const switchTimerRef = useRef(null)

  useEffect(() => {
    if (deckLangRef.current === activeLang) return

    clearTimeout(switchTimerRef.current)
    poolRef.current = []
    deckRef.current = shuffle(getPresetBank(activeLang))
    deckLangRef.current = activeLang
    deckCursorRef.current = 1
    hasStartedBatchRef.current = false
    isFetchingRef.current = false
    setText(deckRef.current[0].text)
    setMood(deckRef.current[0].mood)
    setFadeIn(true)
  }, [activeLang])

  // 120ms 过渡：淡出 → 60ms 后换文字 → 淡入
  const applyMessage = useCallback((newText, newMood) => {
    clearTimeout(switchTimerRef.current)
    setFadeIn(false)
    switchTimerRef.current = setTimeout(() => {
      setText(newText)
      setMood(newMood)
      setFadeIn(true)
    }, FADE_HALF_MS)
  }, [])

  // 从随机牌堆取下一条，用完自动重新洗牌
  const nextDeck = useCallback(() => {
    let cursor = deckCursorRef.current
    if (cursor >= deckRef.current.length) {
      deckRef.current = shuffle(getPresetBank(activeLang))
      cursor = 0
    }
    const item = deckRef.current[cursor]
    deckCursorRef.current = cursor + 1
    return item
  }, [activeLang])

  const fetchBatch = useCallback(async () => {
    if (isFetchingRef.current) return
    isFetchingRef.current = true
    console.log('🔮 [VirtualLover] 开始批量获取消息...')
    const requestLang = activeLang
    try {
      const items = await fetchVirtualLoverBatch({ lang: requestLang })
      if (deckLangRef.current !== requestLang) return
      if (Array.isArray(items) && items.length > 0) {
        poolRef.current.push(...items)
        console.log(`✅ [VirtualLover] 获取 ${items.length} 条，池共 ${poolRef.current.length} 条`)
      }
    } catch (err) {
      console.warn('⚠️ [VirtualLover] 批量获取失败:', err.message)
    } finally {
      isFetchingRef.current = false
    }
  }, [activeLang])

  const nextMessage = useCallback(() => {
    // 优先消费 AI 池
    if (poolRef.current.length > 0) {
      const msg = poolRef.current.shift()
      applyMessage(msg.text, msg.mood || '温柔')
      if (poolRef.current.length <= POOL_REFILL_THRESHOLD && !isFetchingRef.current) {
        fetchBatch()
      }
      return
    }

    // AI 池为空时从随机牌堆取
    const item = nextDeck()
    applyMessage(item.text, item.mood)
    if (!hasStartedBatchRef.current) {
      hasStartedBatchRef.current = true
      fetchBatch()
    }
  }, [applyMessage, fetchBatch, nextDeck])

  const clearMemory = useCallback(async () => {
    try {
      await clearVirtualLoverMemory()
      clearTimeout(switchTimerRef.current)
      poolRef.current = []
      deckRef.current = shuffle(getPresetBank(activeLang))
      deckLangRef.current = activeLang
      deckCursorRef.current = 1
      hasStartedBatchRef.current = false
      isFetchingRef.current = false
      setText(deckRef.current[0].text)
      setMood(deckRef.current[0].mood)
      setFadeIn(true)
    } catch (error) {
      console.error('Clear memory failed:', error)
    }
  }, [activeLang])

  return {
    clearMemory,
    fadeIn,
    fallback: false,
    loading: false,
    mood,
    provider: 'grok',
    text,
    timestamp: '',
    refreshMessage: nextMessage,
  }
}

export { useVirtualLover }
