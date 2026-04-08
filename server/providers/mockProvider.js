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

const HEALTH_PLAN_POOLS = {
  zh: {
    summaries: [
      '今天整体节奏比较稳，继续把训练和恢复平衡好，状态会更顺。',
      '最近的执行度不错，下一阶段重点是降低波动，让身体更持续地进入状态。',
      '当前更适合走稳扎稳打路线，先把恢复质量提上来，再慢慢加训练量。',
      '你的基础表现已经在线了，接下来重点放在饮食细节和训练节奏配合上。',
    ],
    dietFocus: [
      '高蛋白 + 抗氧化 + 规律补水',
      '恢复优先 + 微量元素补充',
      '轻负担饮食 + 稳定能量供给',
      '蛋白修复 + 血流支持',
    ],
    dietSuggestions: [
      { name: '鸡蛋', benefit: '补充优质蛋白，帮助恢复和修复' },
      { name: '燕麦', benefit: '提供稳定能量，减少训练后疲劳波动' },
      { name: '三文鱼', benefit: '补充优质脂肪，有助于降低炎症反应' },
      { name: '南瓜籽', benefit: '补充锌和镁，支持恢复与放松' },
      { name: '蓝莓', benefit: '提供抗氧化支持，缓解高强度后的压力感' },
      { name: '西兰花', benefit: '补充维生素和膳食纤维，帮助整体代谢' },
      { name: '香蕉', benefit: '补充钾元素，减轻运动后的紧绷感' },
      { name: '酸奶', benefit: '帮助补充蛋白与益生菌，维持消化状态' },
    ],
    exerciseSuggestions: [
      { name: '快走有氧', plan: '每周4次，每次25-35分钟', reason: '提高循环效率，维持稳定耐力输出' },
      { name: '骨盆底训练', plan: '每天1次，每次8-10分钟分组完成', reason: '增强控制力和耐受度，适合长期坚持' },
      { name: '核心稳定训练', plan: '每周3次，每次12分钟', reason: '提升发力稳定性，减少代偿带来的疲劳' },
      { name: '深蹲基础组', plan: '每周2次，每次3组，每组12次', reason: '激活下肢与核心联动，增强整体控制' },
      { name: '拉伸放松', plan: '训练后进行8分钟髋部和腿后侧拉伸', reason: '降低紧张感，提升恢复效率' },
      { name: '低冲击跳绳', plan: '每周2次，每次5轮，每轮1分钟', reason: '提升心肺和节奏感，但不过度堆高疲劳' },
    ],
    vibrationModes: [
      { mode: 'rhythmic', desc: '中低频稳定推进，更适合恢复后的持续进入状态', reason: '当前阶段先要稳住节奏，不适合直接拉到很高强度。' },
      { mode: 'pulse', desc: '短脉冲分段刺激，适合做节奏唤醒', reason: '在状态略疲惫时，分段刺激更容易控制负担。' },
      { mode: 'wave', desc: '波浪式渐强渐弱，更适合从放松过渡到训练', reason: '当前更需要顺滑过渡，而不是一下进入峰值。' },
    ],
  },
  en: {
    summaries: [
      'Your rhythm looks relatively stable today. Keep training and recovery balanced so the next session feels smoother.',
      'Your recent consistency is solid. The next focus is reducing swings and helping the body enter a steady state more often.',
      'A steady, recovery-first route fits you best right now. Improve recovery quality before increasing training load.',
      'Your baseline performance is in place. Next, focus on diet details and training rhythm working together.',
    ],
    dietFocus: [
      'High protein + antioxidants + steady hydration',
      'Recovery first + micronutrient support',
      'Light meals + stable energy',
      'Protein repair + blood-flow support',
    ],
    dietSuggestions: [
      { name: 'Eggs', benefit: 'Provide quality protein to support recovery and repair.' },
      { name: 'Oats', benefit: 'Provide steady energy and reduce post-training fatigue swings.' },
      { name: 'Salmon', benefit: 'Adds healthy fats that help manage inflammation.' },
      { name: 'Pumpkin Seeds', benefit: 'Add zinc and magnesium to support recovery and relaxation.' },
      { name: 'Blueberries', benefit: 'Offer antioxidant support after higher-intensity sessions.' },
      { name: 'Broccoli', benefit: 'Adds vitamins and fiber for overall metabolism.' },
      { name: 'Banana', benefit: 'Adds potassium to ease tightness after exercise.' },
      { name: 'Yogurt', benefit: 'Adds protein and probiotics for digestion support.' },
    ],
    exerciseSuggestions: [
      { name: 'Brisk Walking', plan: '4 times weekly, 25-35 minutes each', reason: 'Improves circulation and supports stable endurance.' },
      { name: 'Pelvic Floor Training', plan: 'Once daily, 8-10 minutes in sets', reason: 'Builds control and tolerance for long-term progress.' },
      { name: 'Core Stability', plan: '3 times weekly, 12 minutes each', reason: 'Improves stable power and reduces compensation fatigue.' },
      { name: 'Basic Squats', plan: '2 times weekly, 3 sets of 12 reps', reason: 'Activates lower-body and core coordination.' },
      { name: 'Stretching', plan: '8 minutes after training for hips and hamstrings', reason: 'Reduces tension and improves recovery efficiency.' },
      { name: 'Low-impact Jump Rope', plan: '2 times weekly, 5 rounds of 1 minute', reason: 'Improves cardio and rhythm without overloading fatigue.' },
    ],
    vibrationModes: [
      { mode: 'Rhythmic Mode', desc: 'Stable low-to-mid frequency progression for smoother recovery entry.', reason: 'This stage needs rhythm stability before very high intensity.' },
      { mode: 'Pulse Mode', desc: 'Short segmented pulses for rhythm activation.', reason: 'When slightly fatigued, segmented stimulation is easier to control.' },
      { mode: 'Wave Mode', desc: 'Gradual rise and fall, suited for moving from relaxation into training.', reason: 'A smooth transition fits better than jumping straight to peak intensity.' },
    ],
  },
}

const lastMessageIndexByLang = {}
const lastHealthFingerprintByLang = {}

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

function buildRandomHealthPlan(lang = 'zh') {
  const pool = HEALTH_PLAN_POOLS[resolveLang(lang)]
  return {
    summary: pool.summaries[Math.floor(Math.random() * pool.summaries.length)],
    dietFocus: pool.dietFocus[Math.floor(Math.random() * pool.dietFocus.length)],
    dietSuggestions: pickRandomUniqueItems(pool.dietSuggestions, 4),
    exerciseSuggestions: pickRandomUniqueItems(pool.exerciseSuggestions, 3),
    nextVibrationMode: pool.vibrationModes[Math.floor(Math.random() * pool.vibrationModes.length)],
    lang: resolveLang(lang),
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
  const activeLang = resolveLang(_promptPayload?.lang || _promptPayload?.context?.lang)

  // 模拟随机延迟（更真实）
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 800 + 300))

  let plan = buildRandomHealthPlan(activeLang)
  const pool = HEALTH_PLAN_POOLS[activeLang]
  if (pool.dietSuggestions.length >= 4 && pool.exerciseSuggestions.length >= 3) {
    let attempts = 0
    while (createHealthFingerprint(plan) === lastHealthFingerprintByLang[activeLang] && attempts < 3) {
      plan = buildRandomHealthPlan(activeLang)
      attempts += 1
    }
  }

  lastHealthFingerprintByLang[activeLang] = createHealthFingerprint(plan)
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
