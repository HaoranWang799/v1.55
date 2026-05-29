type Props = {
  currentStep: 1 | 2 | 3
}

export default function KycProgress({ currentStep }: Props) {
  return (
    <div className="sticky top-0 z-30 border-b border-white/10 bg-[#131313]/80 backdrop-blur-xl px-5 pt-4 pb-3">
      <div className="mb-2 flex items-center justify-between text-[11px] text-[#a98892]">
        <span>Step {currentStep} of 3</span>
        <span>Identity Verification</span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-[#353535]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#ff479b] to-[#6e208c] shadow-[0_0_16px_rgba(255,71,155,0.45)] transition-all duration-300"
          style={{ width: `${(currentStep / 3) * 100}%` }}
        />
      </div>
    </div>
  )
}
