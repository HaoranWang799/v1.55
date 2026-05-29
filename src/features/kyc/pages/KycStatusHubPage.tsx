import { useNavigate } from 'react-router-dom'
import AdultVerifiedBadge from '../components/AdultVerifiedBadge'

export default function KycStatusHubPage() {
  const navigate = useNavigate()

  function startFlow() {
    navigate('/kyc/step1')
  }

  return (
    <div className="min-h-screen bg-background font-body-lg text-on-background antialiased selection:bg-primary-container selection:text-on-primary-container">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-[10%] -top-[10%] h-[50vw] w-[50vw] rounded-full bg-primary-container/10 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[40vw] w-[40vw] rounded-full bg-secondary-container/10 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[480px] px-container-margin py-section-gap">
        <header className="mb-section-gap text-center">
          <div className="mb-stack-md inline-flex h-12 w-12 items-center justify-center rounded-xl border border-outline-variant/30 bg-surface-container">
            <span className="material-symbols-outlined text-primary-container">shield_person</span>
          </div>
          <h1 className="mb-stack-sm font-display-lg text-display-lg tracking-tight text-on-surface">Identity Verification</h1>
          <p className="mx-auto max-w-xl font-body-lg text-body-lg text-on-surface-variant">
            Secure your experience. Component variants demonstrating different states of the KYC funnel.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-stack-lg">
          <div className="flex flex-col gap-stack-sm">
            <span className="pl-1 font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">
              Variant 1: Action Required
            </span>
            <div className="relative overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container-low transition-all duration-300 hover:border-outline-variant/50">
              <div className="flex flex-col items-start gap-4 p-5">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-outline-variant/30 bg-surface">
                  <span className="material-symbols-outlined text-on-surface-variant">lock</span>
                </div>
                <div className="flex-1">
                  <h3 className="mb-0.5 font-body-lg text-body-lg font-semibold text-on-surface">Adult Access Locked</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Verify your identity to unlock 18+ content and features.</p>
                </div>
                <button
                  type="button"
                  onClick={startFlow}
                  className="w-full rounded-full bg-gradient-to-r from-primary-container to-secondary-container px-5 py-2.5 font-label-caps text-label-caps font-semibold text-on-primary shadow-[0_4px_14px_0_rgba(255,71,155,0.2)] transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_6px_20px_rgba(255,71,155,0.3)]"
                >
                  Verify Now
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-stack-sm">
            <span className="pl-1 font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">
              Variant 2: Processing
            </span>
            <div className="relative overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container-low transition-all duration-300 hover:border-outline-variant/50">
              <div className="absolute left-0 top-0 h-0.5 w-full bg-surface-variant">
                <div className="h-full w-1/3 rounded-r-full bg-primary-container animate-pulse" />
              </div>
              <div className="flex flex-col items-start gap-4 p-5">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-outline-variant/30 bg-surface">
                  <span className="material-symbols-outlined text-secondary">hourglass_top</span>
                </div>
                <div className="flex-1">
                  <h3 className="mb-0.5 font-body-lg text-body-lg font-semibold text-on-surface">Review in Progress</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Your documents are currently being analyzed.</p>
                </div>
                <button
                  type="button"
                  onClick={startFlow}
                  className="w-full rounded-full border border-outline bg-transparent px-5 py-2.5 font-label-caps text-label-caps font-semibold text-secondary transition-colors duration-200 hover:bg-surface-variant/50"
                >
                  View Status
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-stack-sm">
            <span className="pl-1 font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">
              Variant 3: Success State
            </span>
            <div className="relative">
              <div className="pointer-events-none absolute inset-0 rounded-xl bg-primary-container/20 blur-xl animate-subtlePulse" />
              <button
                type="button"
                onClick={startFlow}
                className="relative w-full overflow-hidden rounded-xl border border-primary-container/50 bg-surface-container-low text-left shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-primary-container/70"
              >
                <div className="flex flex-col items-start gap-4 p-5">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-primary-container/30 bg-primary-container/10">
                    <span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                      verified
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-0.5 font-body-lg text-body-lg font-semibold text-primary">Adult Access Enabled</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Identity confirmed. All restrictions lifted.</p>
                  </div>
                  <AdultVerifiedBadge />
                </div>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-stack-sm">
            <span className="pl-1 font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">
              Variant 4: Intervention Needed
            </span>
            <div className="relative overflow-hidden rounded-xl border border-error/30 bg-surface-container-low transition-all duration-300 hover:border-error/50">
              <div className="flex flex-col items-start gap-4 p-5">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-error/20 bg-error/10">
                  <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>
                    error
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="mb-0.5 font-body-lg text-body-lg font-semibold text-on-surface">Verification Needs Review</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Image quality was too low. Please try again.</p>
                </div>
                <button
                  type="button"
                  onClick={startFlow}
                  className="w-full rounded-full border border-outline-variant bg-surface-bright px-5 py-2.5 font-label-caps text-label-caps font-semibold text-on-surface transition-colors duration-200 hover:bg-surface-variant hover:text-primary"
                >
                  Resubmit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
