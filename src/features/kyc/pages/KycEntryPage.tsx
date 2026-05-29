import { useNavigate } from 'react-router-dom'

export default function KycEntryPage() {
  const navigate = useNavigate()

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-container-margin font-body-sm text-on-surface">
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
        <div className="absolute -left-10 -top-10 h-[300px] w-[300px] rounded-full bg-primary opacity-10 blur-[100px]" />
        <div className="absolute -right-10 bottom-10 h-[200px] w-[200px] rounded-full bg-secondary opacity-10 blur-[80px]" />
      </div>

      <main className="relative z-10 flex w-full flex-1 flex-col items-center justify-center space-y-stack-lg py-12">
        <div className="w-full space-y-stack-sm text-center">
          <h1 className="font-display-lg text-display-lg text-on-surface">Adult Access Verification</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Before entering immersive features, we need to confirm you are 18+ and legally eligible to use this service.
          </p>
          <p className="mt-2 font-chinese-sub text-chinese-sub text-outline-variant">
            进入沉浸式功能前，请先完成成人身份验证。
          </p>
        </div>

        <div className="relative flex w-full flex-col items-center justify-center space-y-stack-md rounded-xl border border-white/10 bg-cyber-gradient p-8 shadow-[0_0_20px_rgba(255,45,149,0.3)]">
          <div className="absolute -top-6 rounded-full border border-white/10 bg-[#0D0118] p-3 shadow-lg">
            <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              security
            </span>
          </div>
          <div className="mt-4 flex h-24 w-24 items-center justify-center rounded-full border border-primary/30 bg-primary-container/10">
            <span className="font-display-lg text-display-lg font-black tracking-tighter text-primary">18+</span>
          </div>
          <div className="mt-4 w-full space-y-stack-sm">
            {[
              ['verified_user', '18+ Only', 'Restricted access content'],
              ['lock', 'Private & Secure', 'Data encrypted locally'],
              ['gavel', 'Compliance Required', 'Adherence to strict guidelines'],
            ].map(([icon, title, desc]) => (
              <div key={title} className="flex items-start space-x-3 rounded-lg border border-white/5 bg-surface-container-low p-3">
                <span className="material-symbols-outlined text-secondary">{icon}</span>
                <div>
                  <p className="font-headline-md text-body-sm font-semibold text-on-surface">{title}</p>
                  <p className="font-body-sm text-chinese-sub text-on-surface-variant">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex w-full flex-col space-y-stack-sm pt-4">
          <button
            type="button"
            onClick={() => navigate('/kyc/identity')}
            className="flex w-full items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-[#FF2D95] to-[#9D50BB] py-4 font-headline-md text-headline-md text-on-primary transition-all hover:opacity-90 hover:shadow-[0_0_15px_rgba(255,45,149,0.5)] active:scale-95"
          >
            <span>I am 18+ · Start Verification</span>
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>
          <button
            type="button"
            className="flex w-full items-center justify-center rounded-lg border border-outline-variant/50 bg-transparent py-3 font-body-sm text-body-sm text-secondary transition-all hover:bg-white/5 active:scale-95"
          >
            <span>Learn Why Verification Is Required</span>
          </button>
        </div>
      </main>

      <footer className="relative z-10 mt-auto w-full py-6 text-center">
        <p className="mx-auto max-w-[80%] font-chinese-sub text-chinese-sub text-outline-variant">
          By proceeding, you agree to our <span className="text-secondary/70 underline">Terms of Service</span> and acknowledge our{' '}
          <span className="text-secondary/70 underline">Privacy Policy</span>. Verification data is handled securely.
        </p>
      </footer>
    </div>
  )
}
