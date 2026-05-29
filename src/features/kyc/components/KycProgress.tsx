import { useL } from '../../../i18n/useL'

type Props = {
  currentStep: 1 | 2 | 3
}

export default function KycProgress({ currentStep }: Props) {
  const L = useL()
  const STEP_LABELS = [L('资格确认', 'Eligibility'), L('身份验证', 'Identity'), L('条款确认', 'Terms')]
  const width = currentStep === 1 ? 33 : currentStep === 2 ? 66 : 100

  return (
    <div>
      <div className="flex items-center justify-between px-container-margin pb-2">
        {STEP_LABELS.map((label, i) => {
          const step = (i + 1) as 1 | 2 | 3
          const isActive = step <= currentStep
          const isCurrent = step === currentStep
          return (
            <div key={label} className="flex items-center gap-2">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-all duration-300 ${
                  isCurrent
                    ? 'bg-primary-container text-white shadow-[0_0_8px_rgba(255,71,155,0.5)]'
                    : isActive
                      ? 'bg-primary-container/60 text-white'
                      : 'bg-surface-variant text-on-surface-variant'
                }`}
              >
                {step}
              </span>
              <span
                className={`font-label-caps text-label-caps transition-colors duration-300 ${
                  isCurrent ? 'text-primary' : isActive ? 'text-on-surface' : 'text-on-surface-variant/50'
                }`}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>
      <div className="relative h-1 w-full bg-surface-variant">
        <div
          className="absolute left-0 top-0 h-full rounded-r-full bg-gradient-to-r from-primary-container to-[#b90067] shadow-[0_0_16px_rgba(255,71,155,0.35)] transition-all duration-500 animate-neonPulse"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  )
}

export function KycTopBar({ title, onBack }: { title?: string; onBack?: () => void }) {
  const L = useL()
  const displayTitle = title ?? L('身份验证', 'Identity Verification')
  return (
    <nav className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-white/10 bg-background/80 px-container-margin backdrop-blur-xl">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center justify-center rounded-full p-2 -ml-2 text-on-surface-variant transition-opacity hover:opacity-80 active:scale-95"
      >
        <span className="material-symbols-outlined text-[24px]">arrow_back</span>
      </button>
      <h1 className="truncate font-headline-md text-headline-md text-primary">{displayTitle}</h1>
      <div className="flex items-center justify-center p-2 -mr-2 text-primary">
        <span className="material-symbols-outlined text-[24px]">security</span>
      </div>
    </nav>
  )
}
