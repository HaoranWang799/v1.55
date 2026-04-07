import { ChevronRight } from 'lucide-react'
import { THINKING_STEPS, THINKING_STEPS_EN } from '../../data/healthData'
import { useApp } from '../../context/AppContext'
import { useL } from '../../i18n/useL'

export function ScoreRing({ score }) {
  const L = useL()
  const R    = 46
  const CIRC = 2 * Math.PI * R
  const offset = CIRC * (1 - score / 100)

  return (
    <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
      <svg width="112" height="112" viewBox="0 0 112 112" className="-rotate-90">
        <circle cx="56" cy="56" r={R} fill="none"
          stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle cx="56" cy="56" r={R} fill="none"
          stroke="url(#scoreGrad)" strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#FF9ACB" />
            <stop offset="100%" stopColor="#B380FF" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-[rgba(245,240,242,0.95)]">{score}</span>
        <span className="text-[9px] text-[rgba(245,240,242,0.45)] tracking-wider">{L('综合评分', 'Overall Score')}</span>
      </div>
    </div>
  )
}

export function MetricCell({ label, value, sub, color, onClick }) {
  const L = useL()
  return (
    <button
      onClick={onClick}
      className="rounded-xl p-2.5 bg-[rgba(255,255,255,0.04)] text-center cursor-pointer
                 active:scale-95 transition-transform hover:bg-[rgba(255,255,255,0.07)] w-full"
    >
      <p className="text-[9px] text-[rgba(245,240,242,0.4)] mb-1">{label}</p>
      <p className={`text-xs font-bold ${color ?? 'text-[rgba(245,240,242,0.85)]'}`}>{value}</p>
      {sub && <p className="text-[9px] text-[rgba(245,240,242,0.35)] mt-0.5">{sub}</p>}
      <p className="text-[8px] text-[rgba(179,128,255,0.45)] mt-1">{L('详情', 'Details')} ›</p>
    </button>
  )
}

export function PlanRow({ icon: Icon, title, sub, onDetail }) {
  const L = useL()
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-[rgba(255,255,255,0.04)] last:border-0">
      <div className="w-8 h-8 rounded-xl bg-[rgba(255,154,203,0.1)] flex items-center justify-center flex-shrink-0">
        <Icon size={15} className="text-[#FF9ACB]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-[rgba(245,240,242,0.85)] truncate">{title}</p>
        <p className="text-[10px] text-[rgba(245,240,242,0.45)] leading-relaxed">{sub}</p>
      </div>
      <button
        onClick={onDetail}
        className="flex-shrink-0 flex items-center gap-0.5 text-[10px] text-[rgba(179,128,255,0.6)] hover:text-[#B380FF] transition-colors"
      >
        {L('详情', 'Details')} <ChevronRight size={11} />
      </button>
    </div>
  )
}

export function ThinkingState({ step }) {
  const { lang } = useApp()
  const steps = lang === 'en' ? THINKING_STEPS_EN : THINKING_STEPS
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-4 animate-fadeUp">
      <div className="relative w-14 h-14 flex items-center justify-center">
        <span
          className="absolute inset-0 rounded-full border-2 border-[rgba(179,128,255,0.15)] border-t-[#B380FF]"
          style={{ animation: 'spin 1s linear infinite' }}
        />
        <span className="text-2xl select-none">🤖</span>
      </div>
      <div className="text-center space-y-1">
        <p
          key={step}
          className="text-[12px] text-[#B380FF] font-medium animate-fadeUp"
        >
          {steps[step]}
        </p>
        <div className="flex gap-1.5 justify-center mt-2">
          {steps.map((_, i) => (
            <span
              key={i}
              className="inline-block h-1 rounded-full transition-all duration-300"
              style={{
                width: i === step ? '12px' : '4px',
                background: i <= step ? '#B380FF' : 'rgba(179,128,255,0.2)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
