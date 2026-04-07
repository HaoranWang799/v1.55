import { X } from 'lucide-react'
import {
  DURATION_DETAIL,
  STATUS_DETAIL,
  INTENSITY_DETAIL,
  HARD_DETAIL,
} from '../../data/healthData'
import { useApp } from '../../context/AppContext'
import { useL } from '../../i18n/useL'

function useHealthLocale() {
  const { lang } = useApp()
  const L = useL()
  const d = (item, field) => (lang === 'en' && item?.[`${field}En`]) || item?.[field]
  return { L, d }
}

function Stars({ score, max = 5 }) {
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={`text-[11px] ${i < score ? 'text-[#FF9ACB]' : 'text-[rgba(255,255,255,0.15)]'}`}>★</span>
      ))}
    </span>
  )
}

function DurationModalContent() {
  const { L, d: localized } = useHealthLocale()
  const maxSecs = Math.max(...DURATION_DETAIL.days.map((d) => d.secs))
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {DURATION_DETAIL.days.map((d) => (
          <div key={d.day} className="flex items-center gap-2">
            <span className={`text-[10px] w-7 flex-shrink-0 ${d.isToday ? 'text-[#FF9ACB] font-bold' : 'text-[rgba(245,240,242,0.5)]'}`}>
              {localized(d, 'day')}
            </span>
            <div className="flex-1 h-2 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(d.secs / maxSecs) * 100}%`,
                  background: d.isToday
                    ? 'linear-gradient(90deg, #FF9ACB, #B380FF)'
                    : 'rgba(179,128,255,0.45)',
                }}
              />
            </div>
            <span className={`text-[10px] w-11 text-right flex-shrink-0 ${d.isToday ? 'text-[#FF9ACB] font-semibold' : 'text-[rgba(245,240,242,0.5)]'}`}>
              {d.duration}
            </span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[rgba(255,255,255,0.06)]">
        <div className="rounded-xl p-3 bg-[rgba(255,255,255,0.04)] text-center">
          <p className="text-[9px] text-[rgba(245,240,242,0.4)] mb-1">{L('近7天平均', '7-day average')}</p>
          <p className="text-sm font-bold text-[rgba(245,240,242,0.9)]">{DURATION_DETAIL.avgDisplay}</p>
        </div>
        <div className="rounded-xl p-3 bg-[rgba(255,255,255,0.04)] text-center">
          <p className="text-[9px] text-[rgba(245,240,242,0.4)] mb-1">{L('建议目标', 'Suggested target')}</p>
          <p className="text-sm font-bold text-[#7fcb9a]">{DURATION_DETAIL.targetDisplay}</p>
        </div>
      </div>
      <p className="text-[10px] text-[rgba(245,240,242,0.4)] leading-relaxed">
        💡 {localized(DURATION_DETAIL, 'targetNote')}
      </p>
    </div>
  )
}

function StatusModalContent() {
  const { L, d: localized } = useHealthLocale()
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-1">
        {STATUS_DETAIL.days.map((d) => (
          <div key={d.day} className="flex flex-col items-center gap-1.5">
            <span className={`text-[9px] font-semibold ${d.color}`}>{localized(d, 'status')}</span>
            <div
              className="w-1.5 h-8 rounded-full"
              style={{
                background: d.isToday ? '#FF9ACB' : 'rgba(255,255,255,0.1)',
                opacity: d.isToday ? 1 : 0.7,
              }}
            />
            <span className={`text-[8px] ${d.isToday ? 'text-[#FF9ACB] font-bold' : 'text-[rgba(245,240,242,0.35)]'}`}>
              {localized(d, 'day')}
            </span>
          </div>
        ))}
      </div>
      <div className="pt-2 border-t border-[rgba(255,255,255,0.06)] space-y-2">
        <p className="text-[10px] text-[rgba(245,240,242,0.4)] tracking-wider">{L('近7天状态分布', '7-day status distribution')}</p>
        {STATUS_DETAIL.distribution.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="text-[10px] w-10 font-medium" style={{ color: item.color }}>{localized(item, 'label')}</span>
            <div className="flex-1 h-2 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${item.pct}%`, background: item.color }}
              />
            </div>
            <span className="text-[10px] text-[rgba(245,240,242,0.4)] w-8 text-right">{item.pct}%</span>
            <span className="text-[9px] text-[rgba(245,240,242,0.3)]">{L(`${item.count}次`, `${item.count}x`)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function IntensityModalContent() {
  const { L, d: localized } = useHealthLocale()
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {INTENSITY_DETAIL.days.map((d) => (
          <div key={d.day} className="flex items-center gap-3">
            <span className={`text-[10px] w-7 flex-shrink-0 ${d.isToday ? 'text-[#FF9ACB] font-bold' : 'text-[rgba(245,240,242,0.5)]'}`}>
              {localized(d, 'day')}
            </span>
            <Stars score={d.score} />
            <span className={`text-[10px] ${d.isToday ? 'text-[#FF9ACB]' : 'text-[rgba(179,128,255,0.7)]'}`}>
              {localized(d, 'label')}
            </span>
          </div>
        ))}
      </div>
      <div className="pt-2 border-t border-[rgba(255,255,255,0.06)] space-y-2">
        <p className="text-[10px] text-[rgba(245,240,242,0.4)] tracking-wider">{L('与平台平均对比', 'Compared with platform average')}</p>
        <div className="flex items-end gap-6 justify-center py-2">
          <div className="flex flex-col items-center gap-1">
            <div
              className="w-10 rounded-t-lg"
              style={{
                height: `${(INTENSITY_DETAIL.myAvg / 5) * 60}px`,
                background: 'linear-gradient(180deg, #FF9ACB, #B380FF)',
              }}
            />
            <span className="text-[10px] font-bold text-[#FF9ACB]">{INTENSITY_DETAIL.myAvg}</span>
            <span className="text-[9px] text-[rgba(245,240,242,0.4)]">{L('我的均值', 'My average')}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div
              className="w-10 rounded-t-lg"
              style={{
                height: `${(INTENSITY_DETAIL.platformAvg / 5) * 60}px`,
                background: 'rgba(255,255,255,0.12)',
              }}
            />
            <span className="text-[10px] font-bold text-[rgba(245,240,242,0.5)]">{INTENSITY_DETAIL.platformAvg}</span>
            <span className="text-[9px] text-[rgba(245,240,242,0.4)]">{L('平台均值', 'Platform average')}</span>
          </div>
        </div>
        <p className="text-[10px] text-[rgba(245,240,242,0.4)] leading-relaxed">
          💡 {localized(INTENSITY_DETAIL, 'note')}
        </p>
      </div>
    </div>
  )
}

function HardScoreModalContent() {
  const { L, d: localized } = useHealthLocale()
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {HARD_DETAIL.days.map((d) => (
          <div key={d.day} className="flex items-center gap-2 rounded-xl p-2 bg-[rgba(255,255,255,0.03)]">
            <span className={`text-[10px] w-7 flex-shrink-0 ${d.isToday ? 'text-[#FF9ACB] font-bold' : 'text-[rgba(245,240,242,0.5)]'}`}>
              {localized(d, 'day')}
            </span>
            <div className="flex-1 flex items-center gap-3 text-[9px]">
              <div>
                <span className="text-[rgba(245,240,242,0.35)]">{L('疲软期', 'Soft')} </span>
                <span className="text-[rgba(245,240,242,0.7)] font-medium">{d.softSecs}s</span>
              </div>
              <div className="w-px h-4 bg-[rgba(255,255,255,0.1)]" />
              <div>
                <span className="text-[rgba(245,240,242,0.35)]">{L('强硬', 'Firm')} </span>
                <span className="text-[rgba(245,240,242,0.7)] font-medium">{d.hardMin}m{d.hardSec}s</span>
              </div>
            </div>
            <span className={`text-[11px] font-bold flex-shrink-0 w-7 text-right ${
              d.grade.startsWith('A') ? 'text-[#FF9ACB]' : 'text-[rgba(179,128,255,0.8)]'
            }`}>
              {d.grade}
            </span>
          </div>
        ))}
      </div>
      <div className="rounded-xl p-3 pt-2 border-t border-[rgba(255,255,255,0.06)]">
        <p className="text-[10px] text-[rgba(245,240,242,0.4)] mb-1 tracking-wider">{L('评分趋势', 'Score trend')}</p>
        <p className="text-[11px] text-[rgba(245,240,242,0.75)] leading-relaxed">
          📈 {localized(HARD_DETAIL, 'trend')}
        </p>
      </div>
    </div>
  )
}

export function MetricModal({ metric, onClose }) {
  const L = useL()
  if (!metric) return null

  const MODAL_CONFIG = {
    duration:  { title: L('使用时长详情', 'Duration Details'),   subtitle: L('近 7 天时长明细', 'Last 7 days'),   content: <DurationModalContent /> },
    status:    { title: L('个人状态详情', 'Personal Status Details'),   subtitle: L('近 7 天状态变化', 'Last 7 days'),   content: <StatusModalContent /> },
    intensity: { title: L('内容激烈度详情', 'Content Intensity Details'), subtitle: L('近 7 天激烈度评分', 'Last 7 days'), content: <IntensityModalContent /> },
    hardScore: { title: L('硬度评分详情', 'Hardness Score Details'),   subtitle: L('近 7 天疲软 / 强硬度记录', 'Last 7 days'), content: <HardScoreModalContent /> },
  }

  const { title, subtitle, content } = MODAL_CONFIG[metric]

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center overscroll-contain"
      style={{ background: 'rgba(5,3,5,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[430px] rounded-t-3xl p-5 pb-[calc(env(safe-area-inset-bottom)+24px)] max-h-[calc(100vh-12px)] overflow-y-auto overscroll-contain"
        style={{ background: 'linear-gradient(160deg, #1e1228, #251840)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-[rgba(255,255,255,0.15)] mx-auto mb-5" />
        <div className="flex items-start justify-between mb-1">
          <div>
            <h3 className="text-sm font-semibold text-[rgba(245,240,242,0.95)]">{title}</h3>
            <p className="text-[10px] text-[rgba(245,240,242,0.4)] mt-0.5">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[rgba(255,255,255,0.08)] flex items-center justify-center flex-shrink-0 ml-3"
          >
            <X size={13} className="text-[rgba(245,240,242,0.5)]" />
          </button>
        </div>
        <div className="border-t border-[rgba(255,255,255,0.06)] my-3" />
        <div className="animate-fadeUp">
          {content}
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full py-3 rounded-2xl text-[12px] font-medium text-[rgba(245,240,242,0.6)] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] active:scale-[0.98] transition-all"
        >
          {L('关闭', 'Close')}
        </button>
      </div>
    </div>
  )
}
