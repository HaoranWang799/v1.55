/**
 * server/providers/mockProvider.js — Mock 数据降级提供者
 *
 * 当 Grok 失败时的自动降级方案
 */

const MOCK_MESSAGES = {
  zh: [
    { text: '今天这么努力，想要什么奖励呢？❤️', mood: '暧昧' },
    { text: '你的坚持真的很让人心疼呢...', mood: '温柔' },
    { text: '又在偷偷用功？我看着呢🙈', mood: '调皮' },
    { text: '这样子想来见我吗？', mood: '暧昧' },
    { text: '你最近真的进步很大呢，为你骄傲 💕', mood: '温柔' },
    { text: '累了吗？要不要休息一下..', mood: '温柔' },
  ],
  en: [
    { text: 'You worked so hard today. What kind of reward do you want?', mood: '暧昧' },
    { text: 'Seeing you keep going like this makes me want to take care of you.', mood: '温柔' },
    { text: 'Working hard in secret again? I noticed.', mood: '调皮' },
    { text: 'Were you trying to come see me like this?', mood: '暧昧' },
    { text: 'You have improved so much lately. I am proud of you.', mood: '温柔' },
    { text: 'Tired? Come rest with me for a moment.', mood: '温柔' },
  ],
}

const HEALTH_SUMMARIES = [
  '今天整体节奏比较稳，继续把训练和恢复平衡好，状态会更顺。',
  '最近的执行度不错，下一阶段重点是降低波动，让身体更持续地进入状态。',
  '当前更适合走稳扎稳打路线，先把恢复质量提上来，再慢慢加训练量。',
  '你的基础表现已经在线了，接下来重点放在饮食细节和训练节奏配合上。',
]

const DIET_FOCUS_OPTIONS = [
  '高蛋白 + 抗氧化 + 规律补水',
  '恢复优先 + 微量元素补充',
  '轻负担饮食 + 稳定能量供给',
  '蛋白修复 + 血流支持',
]

const DIET_SUGGESTION_POOL = [
  { name: '鸡蛋', benefit: '补充优质蛋白，帮助恢复和修复' },
  { name: '燕麦', benefit: '提供稳定能量，减少训练后疲劳波动' },
  { name: '三文鱼', benefit: '补充优质脂肪，有助于降低炎症反应' },
  { name: '南瓜籽', benefit: '补充锌和镁，支持恢复与放松' },
  { name: '蓝莓', benefit: '提供抗氧化支持，缓解高强度后的压力感' },
  { name: '西兰花', benefit: '补充维生素和膳食纤维，帮助整体代谢' },
  { name: '香蕉', benefit: '补充钾元素，减轻运动后的紧绷感' },
  { name: '酸奶', benefit: '帮助补充蛋白与益生菌，维持消化状态' },
]

const EXERCISE_SUGGESTION_POOL = [
  { name: '快走有氧', plan: '每周4次，每次25-35分钟', reason: '提高循环效率，维持稳定耐力输出' },
  { name: '骨盆底训练', plan: '每天1次，每次8-10分钟分组完成', reason: '增强控制力和耐受度，适合长期坚持' },
  { name: '核心稳定训练', plan: '每周3次，每次12分钟', reason: '提升发力稳定性，减少代偿带来的疲劳' },
  { name: '深蹲基础组', plan: '每周2次，每次3组，每组12次', reason: '激活下肢与核心联动，增强整体控制' },
  { name: '拉伸放松', plan: '训练后进行8分钟髋部和腿后侧拉伸', reason: '降低紧张感，提升恢复效率' },
  { name: '低冲击跳绳', plan: '每周2次，每次5轮，每轮1分钟', reason: '提升心肺和节奏感，但不过度堆高疲劳' },
]

const VIBRATION_MODE_OPTIONS = [
  {
    mode: 'rhythmic',
    desc: '中低频稳定推进，更适合恢复后的持续进入状态',
    reason: '当前阶段先要稳住节奏，不适合直接拉到很高强度。',
  },
  {
    mode: 'pulse',
    desc: '短脉冲分段刺激，适合做节奏唤醒',
    reason: '在状态略疲惫时，分段刺激更容易控制负担。',
  },
  {
    mode: 'wave',
    desc: '波浪式渐强渐弱，更适合从放松过渡到训练',
    reason: '当前更需要顺滑过渡，而不是一下进入峰值。',
  },
]

const lastMessageIndexByLang = {}
let lastHealthFingerprint = ''

function resolveLang(lang) {
  return lang === 'en' ? 'en' : 'zh'
}

function pickRandomUniqueItems(pool, count) {
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

function createHealthFingerprint(plan) {
  return JSON.stringify({
    summary: plan.summary,
    diet: plan.dietSuggestions.map((item) => item.name),
    exercise: plan.exerciseSuggestions.map((item) => item.name),
    mode: plan.nextVibrationMode.mode,
  })
}

function buildRandomHealthPlan() {
  return {
    summary: HEALTH_SUMMARIES[Math.floor(Math.random() * HEALTH_SUMMARIES.length)],
    dietFocus: DIET_FOCUS_OPTIONS[Math.floor(Math.random() * DIET_FOCUS_OPTIONS.length)],
    dietSuggestions: pickRandomUniqueItems(DIET_SUGGESTION_POOL, 4),
    exerciseSuggestions: pickRandomUniqueItems(EXERCISE_SUGGESTION_POOL, 3),
    nextVibrationMode: VIBRATION_MODE_OPTIONS[Math.floor(Math.random() * VIBRATION_MODE_OPTIONS.length)],
  }
}

/**
 * 生成虚拟恋人消息 (Mock)
 */
export async function generateLoverMessage(_promptPayload, _apiKeyOverride = '') {
  console.log('📦 [MockProvider] 返回模拟消息')
  const activeLang = resolveLang(_promptPayload?.lang || _promptPayload?.context?.lang)
  const pool = MOCK_MESSAGES[activeLang]

  // 模拟随机延迟（更真实）
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 500 + 200))

  let randomIndex = Math.floor(Math.random() * pool.length)
  if (pool.length > 1 && randomIndex === lastMessageIndexByLang[activeLang]) {
    randomIndex = (randomIndex + 1) % pool.length
  }
  lastMessageIndexByLang[activeLang] = randomIndex
  const mockMessage = pool[randomIndex]

  return {
    text: mockMessage.text,
    mood: mockMessage.mood,
    lang: activeLang,
  }
}

/**
 * 生成健康计划 (Mock)
 */
export async function generateHealthPlan(_promptPayload, _apiKeyOverride = '') {
  console.log('📦 [MockProvider] 返回模拟健康计划')

  // 模拟随机延迟（更真实）
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 800 + 300))

  let plan = buildRandomHealthPlan()
  if (DIET_SUGGESTION_POOL.length >= 4 && EXERCISE_SUGGESTION_POOL.length >= 3) {
    let attempts = 0
    while (createHealthFingerprint(plan) === lastHealthFingerprint && attempts < 3) {
      plan = buildRandomHealthPlan()
      attempts += 1
    }
  }

  lastHealthFingerprint = createHealthFingerprint(plan)
  return plan
}

/**
 * 获取社区帖子 (Mock)
 */
export async function getCommunityPosts(tab, page, limit) {
  console.log('📦 [MockProvider] 返回社区帖子 (mock)')

  // 模拟随机延迟（更真实）
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 600 + 200))

  const { getPostsByTab } = await import('../data/communityData.js')
  const result = getPostsByTab(tab, page, limit)

  return {
    ...result,
    _provider: 'mock',
  }
}

export const mockProvider = {
  generateLoverMessage,
  generateHealthPlan,
  getCommunityPosts,
}

export default mockProvider
