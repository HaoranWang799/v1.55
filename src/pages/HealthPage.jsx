/**
 * HealthPage.jsx — 健康数据 v4 (重构版)
 *
 * v4 变更：
 *   • 静态数据提取到 src/data/healthData.js
 *   • 子组件提取到 src/components/health/ (MetricModals, HealthWidgets)
 *   • 本文件仅保留主逻辑
 */
import { useState, useEffect } from 'react'
import { Zap, Utensils, Dumbbell, ChevronRight } from 'lucide-react'
import { usePlanPool } from '../hooks/usePlanPool'
import {
  TODAY_STATS, BAR_DATA,
  HEALTH_TIPS, HEALTH_TIPS_EN,
  THINKING_STEPS, THINKING_STEPS_EN,
  buildHealthPlanPayload,
} from '../data/healthData'
import { MetricModal } from '../components/health/MetricModals'
import {
  ScoreRing, MetricCell,
  PlanRow, ThinkingState,
} from '../components/health/HealthWidgets'
import { useApp } from '../context/AppContext'
import { useL } from '../i18n/useL'

export default function HealthPage() {
  const { lang } = useApp()
  const L = useL()
  const d = (item, field) => (lang === 'en' && item?.[field + 'En']) || item?.[field]
  // ── 方案池（真实 API 请求 + mock fallback）──────────
  const {
    currentPlan,
    planVisible,
    isSwitching,
    isFallbackMode,
    isCurrentPlanUpgrading,
    lastPlanMeta,
    handleGeneratePlan,
  } = usePlanPool(buildHealthPlanPayload, lang)

  // ── 切换动画期间循环切换 ThinkingState 步骤 ────────────
  const [thinkingStep, setThinkingStep] = useState(0)
  useEffect(() => {
    if (!isSwitching) { setThinkingStep(0); return }
    // 1700ms 动画内均匀切换所有步骤
    const ticker = setInterval(() => {
      setThinkingStep((s) => (s + 1) % (lang === 'en' ? THINKING_STEPS_EN : THINKING_STEPS).length)
    }, Math.floor(1700 / (lang === 'en' ? THINKING_STEPS_EN : THINKING_STEPS).length))
    return () => clearInterval(ticker)
  }, [isSwitching])

  // ── 健康小贴士轮播 ──────────────────────────────────────
  const [tipIdx, setTipIdx] = useState(0)
  const activeTips = Array.from(
    new Set([...(currentPlan?.recoveryTips || []), ...(lang === 'en' ? HEALTH_TIPS_EN : HEALTH_TIPS)])
  ).slice(0, 6)
  const tipCount = 6

  useEffect(() => {
    setTipIdx(0)
    if (tipCount <= 1) return undefined
    const t = setInterval(() => {
      setTipIdx((i) => (i + 1) % tipCount)
    }, 4000)
    return () => clearInterval(t)
  }, [tipCount])

  // ── 当前计划数据 ─────────────────────────────────────────
  const diet     = currentPlan?.dietSuggestions     || []
  const exercise = currentPlan?.exerciseSuggestions || []
  const vib      = currentPlan?.nextVibrationMode || null

  // ── 指标弹窗状态 ─────────────────────────────────────────
  // activeMetric: 'duration' | 'status' | 'intensity' | 'hardScore' | null
  // TODO: 弹窗数据未来可从 /api/device/metric-detail?type={activeMetric} 动态拉取
  const [activeMetric, setActiveMetric] = useState(null)
  // ── 分享战绩弹窗状态 ─────────────────────────────────────
  const [showShareModal, setShowShareModal] = useState(false)

  // ── 当前计划数据 ─────────────────────────────────────────
  return (
    <div className="px-4 pt-4 pb-8 space-y-5 page-enter">

      {/* ═══ 今日概览卡片 ════════════════════════════════════ */}
      {/* TODO: 替换为真实硬件传感器数据（蓝牙 / 健康 SDK） */}
      <section
        className="rounded-2xl p-4 card-glow page-section page-delay-1"
        style={{ background: 'linear-gradient(145deg, #1e1028, #251840)' }}
      >
        <p className="text-[10px] text-[rgba(245,240,242,0.4)] tracking-wider mb-3">{L('本次使用状态', 'Session Status')}</p>

        {/* 环形评分 + 右侧可点击指标格 */}
        <div className="flex items-center gap-4 mb-4">
          <ScoreRing score={TODAY_STATS.score} />
          <div className="flex-1 grid grid-cols-2 gap-2">
            {/* 使用时长 — 点击打开弹窗 */}
            <MetricCell
              label={L('使用时长', 'Duration')}
              value={TODAY_STATS.duration}
              color="text-[rgba(245,240,242,0.9)]"
              onClick={() => setActiveMetric('duration')}
            />
            {/* 个人状态 — 点击打开弹窗 */}
            <MetricCell
              label={L('个人状态', 'Personal Status')}
              value={d(TODAY_STATS, 'status')}
              color={
                TODAY_STATS.status === '兴奋' ? 'text-[#FF9ACB]' :
                TODAY_STATS.status === '良好' ? 'text-[#7fcb9a]' :
                'text-[#ffa07a]'
              }
              onClick={() => setActiveMetric('status')}
            />
            {/* 内容激烈度 — 点击打开弹窗 */}
            <MetricCell
              label={L('内容激烈度', 'Intensity')}
              value={d(TODAY_STATS, 'intensity')}
              color="text-[#B380FF]"
              onClick={() => setActiveMetric('intensity')}
            />
            {/* 硬度评分 — 点击打开弹窗 */}
            <MetricCell
              label={L('硬度评分', 'Hardness Score')}
              value={TODAY_STATS.hardScore}
              color="text-[#FF9ACB]"
              onClick={() => setActiveMetric('hardScore')}
            />
          </div>
        </div>

        {/* 硬度监控详情 */}
        <div
          className="rounded-xl p-3 flex items-center gap-3"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          <Zap size={14} className="text-[#FF9ACB] flex-shrink-0" />
          <div className="flex-1 flex items-center gap-4 text-[10px]">
            <div>
              <p className="text-[rgba(245,240,242,0.4)]">{L('疲软期', 'Recovery Period')}</p>
              <p className="font-semibold text-[rgba(245,240,242,0.8)]">{TODAY_STATS.softSecs}s</p>
            </div>
            <div className="w-px h-6 bg-[rgba(255,255,255,0.1)]" />
            <div>
              <p className="text-[rgba(245,240,242,0.4)]">{L('强硬度时间', 'Endurance Time')}</p>
              <p className="font-semibold text-[rgba(245,240,242,0.8)]">
                {TODAY_STATS.hardMin}m {TODAY_STATS.hardSec}s
              </p>
            </div>
            <div className="w-px h-6 bg-[rgba(255,255,255,0.1)]" />
            <div>
              <p className="text-[rgba(245,240,242,0.4)]">{L('综合评级', 'Overall Rating')}</p>
              <p className="font-bold text-[#FF9ACB]">{TODAY_STATS.hardScore}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 亚洲猛男榜排名卡片 ══════════════════════════════ */}
      {/* TODO: 替换为真实后端排名服务（/api/leaderboard/global） */}
      <section className="page-section page-delay-2">
        <div className="bg-white/5 rounded-2xl p-5">
          {/* 全国排名 */}
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">💪</span>
            <div>
              <div className="text-2xl font-bold text-[rgba(245,240,242,0.95)]">{L('亚洲猛男榜', 'Asia Power Ranking')}</div>
              <div
                className="text-3xl font-bold tabular-nums"
                style={{
                  background: 'linear-gradient(135deg, #FF9ACB, #B380FF)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {L('第 12,345 位', 'Rank #12,345')}
              </div>
              <div className="text-sm text-[rgba(245,240,242,0.5)] mt-0.5">{L('击败全国 98% 的猛男', 'Beat 98% of all men nationwide')}</div>
            </div>
          </div>
          {/* 城市 + 好友排名 */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl p-3 bg-[rgba(255,154,203,0.06)] border border-[rgba(255,154,203,0.1)] text-center">
              <p className="text-[9px] text-[rgba(245,240,242,0.4)] mb-1 tracking-wider">{L('本城排名', 'City Ranking')}</p>
              <p className="text-sm font-bold" style={{ background: 'linear-gradient(135deg, #FF9ACB, #B380FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{L('北京 第 888 名', 'Beijing Rank #888')}</p>
              <p className="text-[10px] text-[rgba(245,240,242,0.4)] mt-0.5">{L('城市前 2%', 'Top 2% in city')}</p>
            </div>
            <div className="rounded-xl p-3 bg-[rgba(179,128,255,0.06)] border border-[rgba(179,128,255,0.1)] text-center">
              <p className="text-[9px] text-[rgba(245,240,242,0.4)] mb-1 tracking-wider">{L('好友排名', 'Friends Ranking')}</p>
              <p className="text-sm font-bold" style={{ background: 'linear-gradient(135deg, #B380FF, #FF9ACB)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{L('超越 92%', 'Beat 92%')}</p>
              <p className="text-[10px] text-[rgba(245,240,242,0.4)] mt-0.5">{L('的好友', 'of friends')}</p>
            </div>
          </div>
        </div>

        {/* 激励文案 */}
        <div className="mt-3 rounded-xl p-3" style={{ background: 'linear-gradient(135deg, rgba(255,154,203,0.06), rgba(179,128,255,0.06))', border: '1px solid rgba(255,154,203,0.1)' }}>
          <p className="text-[11px] text-center font-medium leading-relaxed" style={{ background: 'linear-gradient(135deg, #FF9ACB, #B380FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        {L('🔥 实力已证明——你不只是参与者，你是今晚的王者', '🔥 Your strength is proven — you\'re not just a player, you\'re tonight\'s king')}
          </p>
          <p className="text-[10px] text-center text-[rgba(245,240,242,0.35)] mt-1">{L('继续保持，王座只属于你', 'Keep it up, the throne is yours')}</p>
        </div>

        {/* 生成分享卡片按钮 */}
        <button
          onClick={() => setShowShareModal(true)}
          className="mt-3 px-6 py-3 rounded-full font-medium w-full text-sm active:scale-[0.98] transition-transform"
          style={{ background: 'linear-gradient(90deg, #FF9ACB, #B380FF)', color: '#1a0a12' }}
        >
          {L('📸 生成猛男战绩分享卡', '📸 Generate Battle Report Card')}
        </button>
      </section>

      {/* ═══ 近 7 天趋势柱状图 ═══════════════════════════════ */}
      {/* TODO: 替换为 Recharts 或 Chart.js 真实图表组件 */}
      <section className="rounded-2xl p-4 card-glow bg-[rgba(30,20,25,0.6)] page-section page-delay-2">
        <p className="text-sm font-semibold text-[rgba(245,240,242,0.8)] mb-4">{L('近 7 天趋势', '7-Day Trend')}</p>
        <div className="flex items-end justify-between h-24 gap-1.5">
          {BAR_DATA.map((bar) => (
            <div key={bar.day} className="flex-1 flex flex-col items-center gap-1.5">
              {/* 时长标签 */}
              <span className={`text-[8px] ${bar.isToday ? 'text-[#FF9ACB]' : 'text-[rgba(245,240,242,0.35)]'}`}>
                {bar.label}
              </span>
              {/* 柱体 */}
              <div
                className="w-full rounded-t-lg transition-all duration-700"
                style={{
                  height: `${(bar.heightPct / 100) * 60}px`,
                  background: bar.isToday
                    ? 'linear-gradient(180deg, #FF9ACB, #d96fa8)'
                    : 'linear-gradient(180deg, rgba(179,128,255,0.6), rgba(179,128,255,0.2))',
                }}
              />
              {/* 星期标签 */}
              <span className={`text-[8px] ${bar.isToday ? 'text-[#FF9ACB] font-bold' : 'text-[rgba(245,240,242,0.35)]'}`}>
                {d(bar, 'day')}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ 针对性训练计划 ══════════════════════════════════ */}
      <section className="rounded-2xl p-4 card-glow bg-[rgba(30,20,25,0.6)] page-section page-delay-3">
        {/* 标题（已移除"重新生成"按钮，统一由 AI 按钮触发） */}
        <p className="text-sm font-semibold text-[rgba(245,240,242,0.8)] mb-3">{L('针对性训练计划', 'Training Plan')}</p>

        {/* ── AI 分析按钮（唯一触发入口）────────────────────── */}
        {/* TODO: 替换为真实 AI 分析 API（/api/ai/health-plan） */}
        <button
          onClick={handleGeneratePlan}
          disabled={isSwitching}
          className={`
            w-full mb-4 py-3 rounded-2xl flex items-center justify-center gap-2.5
            text-sm font-medium transition-all active:scale-[0.98]
            ${isSwitching
              ? 'bg-[rgba(179,128,255,0.1)] text-[rgba(179,128,255,0.5)] cursor-not-allowed'
              : 'bg-[rgba(179,128,255,0.12)] text-[#B380FF] border border-[rgba(179,128,255,0.2)] hover:bg-[rgba(179,128,255,0.18)]'
            }
          `}
        >
          {isSwitching ? (
            <>
              <span
                className="w-4 h-4 rounded-full border-2 border-[rgba(179,128,255,0.3)] border-t-[#B380FF]"
                style={{ animation: 'spin 0.8s linear infinite' }}
              />
              {L('AI 思考中…', 'AI Thinking...')}
            </>
          ) : (
            <>🤖 {L('AI分析&智能生成训练计划', 'AI Analysis & Generate Training Plan')}</>
          )}
        </button>

        {/* ── 计划内容区三态：思考中 / 占位提示 / 计划内容 ── */}
        {isSwitching ? (
          /* 思考动画（1.5s，每 375ms 切换一条文案） */
          <ThinkingState step={thinkingStep} />
        ) : !planVisible ? (
          /* 占位提示：初始状态 & 重新生成前的空态 */
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-center animate-fadeUp">
            <span className="text-4xl select-none">✨</span>
            <p className="text-[12px] text-[rgba(245,240,242,0.45)] leading-relaxed">
              {isFallbackMode ? L('网络异常，已切换本地模板', 'Network error, switched to local template') : L('点击上方按钮', 'Tap the button above')}<br />{L('AI 将根据你的健康数据生成专属训练计划', 'AI will generate a personalized training plan based on your health data')}
            </p>
          </div>
        ) : (
          <>
            {/* AI 总结 */}
            <div className="mb-3 rounded-[22px] p-5 bg-[rgba(179,128,255,0.08)] border border-[rgba(179,128,255,0.14)]">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[15px] font-semibold text-[rgba(245,240,242,0.92)] tracking-[0.01em]">{L('AI 分析结论', 'AI Analysis')}</p>
                {isCurrentPlanUpgrading ? (
                  <span className="text-[11px] px-4 py-1.5 rounded-full bg-[rgba(100,255,150,0.12)] text-[rgba(120,255,165,0.88)]">{L('AI 优化中…', 'AI Optimizing...')}</span>
                ) : currentPlan?.fallback ? (
                  <span className="text-[11px] px-4 py-1.5 rounded-full bg-[rgba(255,180,120,0.12)] text-[rgba(255,198,145,0.88)]">{L('已切换', 'Switched')}</span>
                ) : (
                  <span className="text-[11px] px-4 py-1.5 rounded-full bg-[rgba(100,255,150,0.12)] text-[rgba(120,255,165,0.9)]">{L('√ AI分析', '√ AI Analysis')}</span>
                )}
              </div>
              {currentPlan?.fallback ? (
                <p className="mt-2 text-[10px] text-[rgba(255,180,120,0.68)]">
                  {L('当前结果已自动切换', 'Results auto-switched')}{currentPlan?.error ? `：${currentPlan.error}` : ''}
                </p>
              ) : null}
              <p className="mt-3 text-[14px] leading-[1.75] text-[rgba(245,240,242,0.72)]">
                {d(currentPlan, 'summary')}
              </p>
            </div>

            {/* 饮食建议 */}
            <div className="mb-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Utensils size={12} className="text-[rgba(245,240,242,0.4)]" />
                <p className="text-[10px] text-[rgba(245,240,242,0.45)] tracking-wider">{L('饮食建议', 'Diet Suggestions')} — {d(currentPlan, 'dietFocus') || L('恢复优先', 'Recovery First')}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {diet.map((item) => (
                  <div
                    key={item.name}
                    className="rounded-xl p-2.5 bg-[rgba(255,255,255,0.04)] flex flex-col gap-1"
                  >
                    <p className="text-[11px] font-semibold text-[rgba(245,240,242,0.85)]">{d(item, 'name')}</p>
                    <p className="text-[9px] text-[rgba(245,240,242,0.4)] leading-relaxed">{d(item, 'benefit')}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 分隔线 */}
            <div className="border-t border-[rgba(255,255,255,0.05)] my-3" />

            {/* 运动建议 */}
            <div className="mb-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Dumbbell size={12} className="text-[rgba(245,240,242,0.4)]" />
                <p className="text-[10px] text-[rgba(245,240,242,0.45)] tracking-wider">{L('运动建议', 'Exercise')}</p>
              </div>
              <div className="space-y-0">
                {exercise.map((item) => (
                  <PlanRow
                    key={item.name}
                    icon={Dumbbell}
                    title={d(item, 'name')}
                    sub={d(item, 'plan')}
                    onDetail={() => alert(`📋 ${d(item, 'name')}\n${d(item, 'plan')}\n\n${L('推荐原因：', 'Reason: ')}${d(item, 'reason') || L('根据你的近期数据匹配该训练。', 'Matched based on your recent data.')}`)}
                  />
                ))}
              </div>
            </div>

            {/* 分隔线 */}
            <div className="border-t border-[rgba(255,255,255,0.05)] my-3" />

            {/* 震动频率建议 */}
            {/* TODO: 替换为真实设备震动控制接口（connectToy, setVibrationMode） */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Zap size={12} className="text-[rgba(245,240,242,0.4)]" />
                <p className="text-[10px] text-[rgba(245,240,242,0.45)] tracking-wider">{L('下次震动频率建议', 'Next Vibration Suggestion')}</p>
              </div>
              {vib && (
                <div
                  className="rounded-xl p-3 flex items-center gap-3"
                  style={{ background: 'linear-gradient(135deg, rgba(255,154,203,0.08), rgba(179,128,255,0.08))' }}
                >
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-[#FF9ACB] mb-0.5">{d(vib, 'mode')}</p>
                    <p className="text-[10px] text-[rgba(245,240,242,0.5)] leading-relaxed">{d(vib, 'desc')}</p>
                  </div>
                  <button
                    onClick={() => alert(`🎛️ ${L('震动模式：', 'Vibration mode: ')}${d(vib, 'mode')}\n${d(vib, 'desc')}\n\n${L('推荐原因：', 'Reason: ')}${d(vib, 'reason') || L('已结合你的近期状态和训练目标调整。', 'Adjusted based on your recent status and training goals.')}`)}
                    className="flex-shrink-0 flex items-center gap-1 text-[10px] text-[rgba(179,128,255,0.6)] hover:text-[#B380FF] transition-colors"
                  >
                    {L('详情', 'Details')} <ChevronRight size={11} />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </section>

      {/* ═══ 健康小贴士（自动轮播 + 点击切换） ════════════ */}
      {/* TODO: 替换为 AI 生成的个性化贴士（/api/health/tips） */}
      <section
        className="rounded-2xl p-4 card-glow flex items-start gap-3 cursor-pointer select-none active:scale-[0.99] transition-transform page-section page-delay-4"
        style={{ background: 'linear-gradient(135deg, #1a1028, #1e1528)' }}
        onClick={() => {
          if (tipCount <= 1) return
          setTipIdx((i) => (i + 1) % tipCount)
        }}
      >
        <span className="text-lg flex-shrink-0 mt-0.5">💡</span>
        <div className="flex-1">
          <p className="text-[10px] text-[rgba(245,240,242,0.35)] mb-1 tracking-wider">{L('健康小贴士', 'Health Tips')}</p>
          <p
            key={tipIdx}           /* key 变化时触发 animate-fadeUp 重播 */
            className="text-[12px] text-[rgba(245,240,242,0.75)] leading-relaxed animate-fadeUp"
          >
            {activeTips[tipIdx]}
          </p>
          {/* 小圆点指示器（固定 6 个） */}
          <div className="flex gap-1 mt-2">
            {Array.from({ length: tipCount }).map((_, i) => (
              <span
                key={i}
                className={`inline-block h-1 rounded-full transition-all ${
                  i === tipIdx ? 'w-3 bg-[#FF9ACB]' : 'w-1 bg-[rgba(255,255,255,0.15)]'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 指标详情弹窗（Portal 式全屏遮罩） ══════════════ */}
      {/* TODO: 弹窗数据改为从 /api/device/metric-detail?type={activeMetric} 动态拉取 */}
      <MetricModal
        metric={activeMetric}
        onClose={() => setActiveMetric(null)}
      />

      {/* ═══ 猛男战绩分享卡弹窗 ══════════════════════════════ */}
      {showShareModal && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-6 overscroll-contain"
          style={{ background: 'rgba(5,3,5,0.80)', backdropFilter: 'blur(10px)' }}
          onClick={() => setShowShareModal(false)}
        >
          <div
            className="w-full max-w-[340px] rounded-3xl p-6 animate-fadeUp"
            style={{ background: 'linear-gradient(145deg, #1e1028, #2a1840)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 顶部拖拽条 */}
            <div className="w-10 h-1 rounded-full bg-[rgba(255,255,255,0.15)] mx-auto mb-5" />

            {/* 分享卡片预览区 */}
            <div
              className="rounded-2xl p-5 mb-4 text-center"
              style={{ background: 'linear-gradient(135deg, #2a1020, #1a0a30)' }}
            >
              {/* 标语 */}
              <div className="mb-2 text-base font-bold tracking-wide" style={{ background: 'linear-gradient(135deg, #FF9ACB, #B380FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {L('今晚，我是王者 👑', 'Tonight, I Am the King 👑')}
              </div>
              <div className="text-4xl mb-2">💪</div>
              <div className="text-[10px] text-[rgba(245,240,242,0.4)] tracking-widest mb-1">{L('亚洲猛男榜', 'Asia Power Ranking')}</div>
              <div
                className="text-4xl font-bold tabular-nums mb-1"
                style={{
                  background: 'linear-gradient(135deg, #FF9ACB, #B380FF)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {L('第 12,345 位', 'Rank #12,345')}
              </div>
              <div className="text-sm text-[rgba(245,240,242,0.6)] mb-3">{L('击败全国 98% 的猛男', 'Beat 98% of all men nationwide')}</div>

              {/* 城市 + 好友排名 */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="rounded-lg p-2 bg-[rgba(255,154,203,0.08)] border border-[rgba(255,154,203,0.12)]">
                  <div className="text-[9px] text-[rgba(245,240,242,0.4)] mb-0.5">{L('本城排名', 'City Ranking')}</div>
                  <div className="text-xs font-bold" style={{ background: 'linear-gradient(135deg, #FF9ACB, #B380FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{L('北京 第 888 名', 'Beijing Rank #888')}</div>
                  <div className="text-[9px] text-[rgba(245,240,242,0.35)]">{L('城市前 2%', 'Top 2% in city')}</div>
                </div>
                <div className="rounded-lg p-2 bg-[rgba(179,128,255,0.08)] border border-[rgba(179,128,255,0.12)]">
                  <div className="text-[9px] text-[rgba(245,240,242,0.4)] mb-0.5">{L('好友排名', 'Friends Ranking')}</div>
                  <div className="text-xs font-bold" style={{ background: 'linear-gradient(135deg, #B380FF, #FF9ACB)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{L('超越 92%', 'Beat 92%')}</div>
                  <div className="text-[9px] text-[rgba(245,240,242,0.35)]">{L('的好友', 'of friends')}</div>
                </div>
              </div>

              {/* 战绩数据 */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[rgba(255,255,255,0.06)]">
                <div className="text-center">
                  <div className="text-base font-bold text-[#FF9ACB]">{TODAY_STATS.hardScore}</div>
                  <div className="text-[9px] text-[rgba(245,240,242,0.4)]">{L('硬度评级', 'Hardness Rating')}</div>
                </div>
                <div className="text-center">
                  <div className="text-base font-bold text-[#B380FF]">{TODAY_STATS.score}</div>
                  <div className="text-[9px] text-[rgba(245,240,242,0.4)]">{L('综合评分', 'Overall Score')}</div>
                </div>
                <div className="text-center">
                  <div className="text-base font-bold text-[rgba(245,240,242,0.85)]">{TODAY_STATS.duration}</div>
                  <div className="text-[9px] text-[rgba(245,240,242,0.4)]">{L('本次时长', 'Duration')}</div>
                </div>
              </div>

              <div className="mt-3 text-[8px] text-[rgba(245,240,242,0.2)] tracking-wider">
                {L('你的她', 'YourHer')} · {new Date().toLocaleDateString(L('zh-CN', 'en-US'))}
              </div>
            </div>

            {/* 操作按钮 */}
            <button
              onClick={() => { alert(L('📸 已保存到相册！（演示模式）', '📸 Saved to album! (Demo mode)')); setShowShareModal(false) }}
              className="w-full py-3 rounded-2xl text-sm font-semibold mb-2 active:scale-[0.98] transition-transform"
              style={{ background: 'linear-gradient(90deg, #FF9ACB, #B380FF)', color: '#1a0a12' }}
            >
              {L('💾 保存到相册', '💾 Save to Album')}
            </button>
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full py-2.5 rounded-2xl text-[12px] text-[rgba(245,240,242,0.4)] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] active:scale-[0.98] transition-transform"
            >
              {L('关闭', 'Close')}
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
