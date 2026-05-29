type Props = {
  currentStep: 1 | 2 | 3
}

export default function KycProgress({ currentStep }: Props) {
  const width = currentStep === 1 ? 18 : currentStep === 2 ? 62 : 95

  return (
    <div className="relative h-1 w-full bg-surface-variant">
      <div
        className="absolute left-0 top-0 h-full rounded-r-full bg-gradient-to-r from-primary-container to-[#b90067] shadow-[0_0_16px_rgba(255,71,155,0.35)] transition-all duration-300 animate-neonPulse"
        style={{ width: `${width}%` }}
      />
    </div>
  )
}

export function KycTopBar({ title = 'Identity Verification', onBack }: { title?: string; onBack?: () => void }) {
  return (
    <nav className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-white/10 bg-background/80 px-container-margin backdrop-blur-xl">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center justify-center rounded-full p-2 -ml-2 text-on-surface-variant transition-opacity hover:opacity-80 active:scale-95"
      >
        <span className="material-symbols-outlined text-[24px]">arrow_back</span>
      </button>
      <h1 className="truncate font-headline-md text-headline-md text-primary">{title}</h1>
      <div className="flex items-center justify-center p-2 -mr-2 text-primary">
        <span className="material-symbols-outlined text-[24px]">security</span>
      </div>
    </nav>
  )
}
