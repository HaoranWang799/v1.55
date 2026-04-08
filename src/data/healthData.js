/**
 * 健康页面静态数据 — 从 HealthPage.jsx 提取
 * TODO: 各数据项替换为真实 API
 */

export const TODAY_STATS = {
  score:      85,
  duration:   '00:23:45',
  status:     '兴奋',
  statusEn:   'Excited',
  intensity:  '激烈',
  intensityEn:'Intense',
  softSecs:   12,
  hardMin:    8,
  hardSec:    20,
  hardScore:  'A-',
}

export const BAR_DATA = [
  { day: '周一', dayEn: 'Mon', heightPct: 40,  label: '18m' },
  { day: '周二', dayEn: 'Tue', heightPct: 65,  label: '28m' },
  { day: '周三', dayEn: 'Wed', heightPct: 28,  label: '12m' },
  { day: '周四', dayEn: 'Thu', heightPct: 82,  label: '35m' },
  { day: '周五', dayEn: 'Fri', heightPct: 55,  label: '24m' },
  { day: '周六', dayEn: 'Sat', heightPct: 92,  label: '39m' },
  { day: '今天', dayEn: 'Today', heightPct: 53,  label: '23m', isToday: true },
]

export const DURATION_DETAIL = {
  days: [
    { day: '周一', dayEn: 'Mon', duration: '18:20', secs: 1100 },
    { day: '周二', dayEn: 'Tue', duration: '28:05', secs: 1685 },
    { day: '周三', dayEn: 'Wed', duration: '12:42', secs: 762 },
    { day: '周四', dayEn: 'Thu', duration: '35:10', secs: 2110 },
    { day: '周五', dayEn: 'Fri', duration: '24:33', secs: 1473 },
    { day: '周六', dayEn: 'Sat', duration: '39:08', secs: 2348 },
    { day: '今天', dayEn: 'Today', duration: '23:45', secs: 1425, isToday: true },
  ],
  avgDisplay: '25:49',
  targetDisplay: '20:00',
  targetNote: '每次 20 分钟以内，有助于保持高质量体验',
  targetNoteEn: 'Keeping each session under 20 minutes helps maintain a high-quality experience',
}

export const STATUS_DETAIL = {
  days: [
    { day: '周一', dayEn: 'Mon', status: '良好', statusEn: 'Good',    color: 'text-[#7fcb9a]' },
    { day: '周二', dayEn: 'Tue', status: '兴奋', statusEn: 'Excited', color: 'text-[#FF9ACB]' },
    { day: '周三', dayEn: 'Wed', status: '第劳', statusEn: 'Fatigued', color: 'text-[#ffa07a]' },
    { day: '周四', dayEn: 'Thu', status: '兴奋', statusEn: 'Excited', color: 'text-[#FF9ACB]' },
    { day: '周五', dayEn: 'Fri', status: '良好', statusEn: 'Good',    color: 'text-[#7fcb9a]' },
    { day: '周六', dayEn: 'Sat', status: '兴奋', statusEn: 'Excited', color: 'text-[#FF9ACB]' },
    { day: '今天', dayEn: 'Today', status: '兴奋', statusEn: 'Excited', color: 'text-[#FF9ACB]', isToday: true },
  ],
  distribution: [
    { label: '兴奋', labelEn: 'Excited',  count: 4, pct: 57, color: '#FF9ACB' },
    { label: '良好', labelEn: 'Good',     count: 2, pct: 29, color: '#7fcb9a' },
    { label: '第劳', labelEn: 'Fatigued', count: 1, pct: 14, color: '#ffa07a' },
  ],
}

export const INTENSITY_DETAIL = {
  days: [
    { day: '周一', dayEn: 'Mon', score: 3, label: '中等', labelEn: 'Medium' },
    { day: '周二', dayEn: 'Tue', score: 4, label: '激烈', labelEn: 'Intense' },
    { day: '周三', dayEn: 'Wed', score: 2, label: '温和', labelEn: 'Mild' },
    { day: '周四', dayEn: 'Thu', score: 5, label: '极烈', labelEn: 'Extreme' },
    { day: '周五', dayEn: 'Fri', score: 4, label: '激烈', labelEn: 'Intense' },
    { day: '周六', dayEn: 'Sat', score: 5, label: '极烈', labelEn: 'Extreme' },
    { day: '今天', dayEn: 'Today', score: 4, label: '激烈', labelEn: 'Intense', isToday: true },
  ],
  myAvg: 3.9,
  platformAvg: 3.1,
  note: '你的内容偏好明显高于平台均值，建议偶尔尝试中低强度内容放松身心',
  noteEn: 'Your content preference is notably higher than the platform average. We suggest occasionally trying medium-low intensity content to relax.',
}

export const HARD_DETAIL = {
  days: [
    { day: '周一', dayEn: 'Mon', softSecs: 18, hardMin: 6, hardSec: 30, grade: 'B+' },
    { day: '周二', dayEn: 'Tue', softSecs: 10, hardMin: 9, hardSec: 10, grade: 'A-' },
    { day: '周三', dayEn: 'Wed', softSecs: 25, hardMin: 4, hardSec: 55, grade: 'B'  },
    { day: '周四', dayEn: 'Thu', softSecs:  8, hardMin: 11, hardSec: 0, grade: 'A'  },
    { day: '周五', dayEn: 'Fri', softSecs: 14, hardMin: 7, hardSec: 45, grade: 'B+' },
    { day: '周六', dayEn: 'Sat', softSecs:  6, hardMin: 12, hardSec: 20, grade: 'A+' },
    { day: '今天', dayEn: 'Today', softSecs: 12, hardMin: 8, hardSec: 20, grade: 'A-', isToday: true },
  ],
  trend: '本周整体呈上升趋势，强硬度时间增长 32%，第软期缩短 15%',
  trendEn: 'Overall upward trend this week: firmness duration increased 32%, softness period shortened 15%',
}

export const DIET_PLANS = [
  [
    { name: '牡螂',   nameEn: 'Oysters',        benefit: '富含锌，直接提升雄激素水平', benefitEn: 'Rich in zinc, directly boosts testosterone levels' },
    { name: '南瓜子', nameEn: 'Pumpkin Seeds', benefit: '高锌高镁，保护前列腺健康', benefitEn: 'High zinc and magnesium, protects prostate health' },
    { name: '菠菜',   nameEn: 'Spinach',        benefit: '富含镁，促进骨盆血液循环', benefitEn: 'Rich in magnesium, promotes pelvic blood circulation' },
    { name: '黑巧克力', nameEn: 'Dark Chocolate', benefit: '含苯乙胺，提升情绪与活力', benefitEn: 'Contains phenylethylamine, boosts mood and vitality' },
  ],
  [
    { name: '深海鱼', nameEn: 'Deep-sea Fish', benefit: 'Omega-3，改善血管弹性与血流', benefitEn: 'Omega-3, improves vascular elasticity and blood flow' },
    { name: '蓝莓',   nameEn: 'Blueberries',    benefit: '强抗氧化，保护生殖系统细胞', benefitEn: 'Strong antioxidants, protects reproductive system cells' },
    { name: '鳄梨',   nameEn: 'Avocado',        benefit: '健康脂肪，平衡激素分泌', benefitEn: 'Healthy fats, balances hormone secretion' },
    { name: '芦笋',   nameEn: 'Asparagus',      benefit: '含天冬氨酸，提升耐力与精力', benefitEn: 'Contains aspartic acid, boosts endurance and energy' },
  ],
  [
    { name: '鸡蛋',   nameEn: 'Eggs',           benefit: '优质蛋白与卵磷脂，强化神经反应', benefitEn: 'Quality protein and lecithin, strengthens neural response' },
    { name: '石榴汁', nameEn: 'Pomegranate Juice', benefit: '抗氧化，改善动脉血流量', benefitEn: 'Antioxidants, improves arterial blood flow' },
    { name: '核桃',   nameEn: 'Walnuts',        benefit: '含精氨酸，促进氧化氮生成', benefitEn: 'Contains arginine, promotes nitric oxide production' },
    { name: '生姜',   nameEn: 'Ginger',         benefit: '提升体温与代谢，增强活力', benefitEn: 'Boosts body temperature and metabolism, enhances vitality' },
  ],
]

export const EXERCISE_PLANS = [
  [
    { name: '凯格尔运动',   nameEn: 'Kegel Exercises',  plan: '每日 3 组，每组 10 次，每次收缩 5 秒', planEn: '3 sets daily, 10 reps each, 5-second hold' },
    { name: '平板支撑',     nameEn: 'Plank',            plan: '每日 2 组，每组 60 秒，强化核心', planEn: '2 sets daily, 60 seconds each, core strengthening' },
    { name: '慢跑',         nameEn: 'Jogging',          plan: '每周 4 次，每次 30 分钟，中等强度', planEn: '4 times weekly, 30 minutes, moderate intensity' },
  ],
  [
    { name: '深蹲',         nameEn: 'Squats',           plan: '每日 3 组，每组 15 次，激活骨盆底肌', planEn: '3 sets daily, 15 reps, activates pelvic floor muscles' },
    { name: '游泳',         nameEn: 'Swimming',         plan: '每周 3 次，每次 40 分钟，全身有氧', planEn: '3 times weekly, 40 minutes, full-body cardio' },
    { name: '瑷伽',         nameEn: 'Yoga',             plan: '每日 15 分钟，改善骨盆灵活性', planEn: '15 minutes daily, improves pelvic flexibility' },
  ],
  [
    { name: '凯格尔+逆凯格尔', nameEn: 'Kegel + Reverse Kegel', plan: '交替进行，每日 4 组，精准控制训练', planEn: 'Alternate sets, 4 sets daily, precision control training' },
    { name: '有氧单车',     nameEn: 'Stationary Bike',  plan: '每周 5 次，每次 25 分钟，中等强度', planEn: '5 times weekly, 25 minutes, moderate intensity' },
    { name: '核心卷腹',     nameEn: 'Core Crunches',    plan: '每日 3 组 × 20 次，强化下腹区域', planEn: '3 sets × 20 reps daily, strengthens lower abs' },
  ],
]

export const VIBRATION_MODES = [
  { mode: '低频渐进模式',  modeEn: 'Low-Freq Progressive',  desc: '从 2Hz 开始，每 2 分钟递增 1Hz，最高至 8Hz', descEn: 'Starts at 2Hz, increments 1Hz every 2 minutes, up to 8Hz' },
  { mode: '脉冲间歇模式',  modeEn: 'Pulse Interval',        desc: '强度 3Hz 持续 10s，停止 5s，循环 8 轮', descEn: 'Intensity 3Hz for 10s, rest 5s, cycle 8 rounds' },
  { mode: '波浪呼吸模式',  modeEn: 'Wave Breathing',        desc: '随呼吸节奏缓慢起伏，频率 1–5Hz', descEn: 'Gently rises and falls with breathing rhythm, 1–5Hz frequency' },
]

export const HEALTH_TIPS = [
  '深度放松有助于提高硬度与持久度',
  '规律作息对性功能有显著正向影响',
  '适量有氧运动可提升体内睾酮水平',
  '保持水分摄入充足，有助于改善整体状态',
  '减少久坐时间，每小时起身活动 5 分钟',
  '高质量睡眠是最好的自然恢复方式',
]

export const HEALTH_TIPS_EN = [
  'Deep relaxation helps improve firmness and endurance',
  'Regular sleep schedule has a significant positive effect on sexual function',
  'Moderate aerobic exercise can boost testosterone levels',
  'Staying well-hydrated helps improve overall condition',
  'Reduce sitting time, get up and move for 5 minutes every hour',
  'Quality sleep is the best natural recovery method',
]

export const THINKING_STEPS = [
  '分析你的使用数据中...',
  '检测到近期时长下降 15%...',
  '评估激素水平与训练状态...',
  '生成个性化训练方案...',
]

export const THINKING_STEPS_EN = [
  'Analyzing your usage data...',
  'Detected 15% decline in recent duration...',
  'Evaluating hormone levels and training status...',
  'Generating personalized training plan...',
]

/**
 * 构建健康计划生成请求的 payload
 * 用于调用 POST /api/health/plan
 */
export function buildHealthPlanPayload(lang = 'zh') {
  const isEn = lang === 'en'

  return {
    lang: isEn ? 'en' : 'zh',
    todayStats: {
      ...TODAY_STATS,
      status: isEn ? TODAY_STATS.statusEn : TODAY_STATS.status,
      intensity: isEn ? TODAY_STATS.intensityEn : TODAY_STATS.intensity,
    },
    weeklyTrend: BAR_DATA.map((item) => ({
      ...item,
      day: isEn ? item.dayEn : item.day,
    })),
    detailSummary: {
      avgDuration: DURATION_DETAIL.avgDisplay,
      statusDistribution: STATUS_DETAIL.distribution
        .map((item) => `${isEn ? item.labelEn : item.label}${item.pct}%`)
        .join(isEn ? ', ' : '、'),
      myAvgIntensity: INTENSITY_DETAIL.myAvg,
      platformAvgIntensity: INTENSITY_DETAIL.platformAvg,
      hardTrend: isEn ? HARD_DETAIL.trendEn : HARD_DETAIL.trend,
    },
  }
}
