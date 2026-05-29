import { useNavigate } from 'react-router-dom'
import { getKycStatus } from '../mockKycData'
import type { KycStatus } from '../types'
import AdultVerifiedBadge from './AdultVerifiedBadge'

type Props = {
  className?: string
}

const statusContent: Record<KycStatus, { kicker: string; title: string; desc: string; icon: string; cta: string }> = {
  not_verified: {
    kicker: 'Variant 1: Action Required',
    title: 'Adult Access Locked',
    desc: 'Verify your identity to unlock 18+ content and features.',
    icon: 'lock',
    cta: 'Verify Now',
  },
  under_review: {
    kicker: 'Variant 2: Processing',
    title: 'Review in Progress',
    desc: 'Your documents are currently being analyzed.',
    icon: 'hourglass_top',
    cta: 'View Status',
  },
  verified: {
    kicker: 'Variant 3: Success State',
    title: 'Adult Access Enabled',
    desc: 'Identity confirmed. All restrictions lifted.',
    icon: 'verified',
    cta: 'View Status',
  },
  rejected: {
    kicker: 'Variant 4: Intervention Needed',
    title: 'Verification Needs Review',
    desc: 'Image quality was too low. Please try again.',
    icon: 'error',
    cta: 'Resubmit',
  },
}

export default function KycStatusCard({ className = '' }: Props) {
  const navigate = useNavigate()
  const status = getKycStatus()
  const copy = statusContent[status]
  const isVerified = status === 'verified'
  const isRejected = status === 'rejected'
  const isReview = status === 'under_review'

  return (
    <div className={`flex flex-col gap-stack-sm ${className}`}>
      <span className="pl-1 font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">
        {copy.kicker}
      </span>
      <div className="relative">
        {isVerified ? <div className="pointer-events-none absolute inset-0 rounded-xl bg-primary-container/20 blur-xl animate-subtlePulse" /> : null}
        {isReview ? (
          <div className="absolute left-0 top-0 z-20 h-0.5 w-full overflow-hidden rounded-t-xl bg-surface-variant">
            <div className="h-full w-1/3 rounded-r-full bg-primary-container animate-pulse" />
          </div>
        ) : null}
        <div
          className={`relative overflow-hidden rounded-xl border bg-surface-container-low transition-all duration-300 ${
            isVerified
              ? 'border-primary-container/50 shadow-lg backdrop-blur-sm'
              : isRejected
                ? 'border-error/30 hover:border-error/50'
                : 'border-outline-variant/20 hover:border-outline-variant/50'
          }`}
        >
          <div className="flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center">
            <div
              className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border ${
                isVerified
                  ? 'border-primary-container/30 bg-primary-container/10'
                  : isRejected
                    ? 'border-error/20 bg-error/10'
                    : 'border-outline-variant/30 bg-surface'
              }`}
            >
              <span
                className={`material-symbols-outlined ${
                  isVerified ? 'text-primary-container' : isRejected ? 'text-error' : isReview ? 'text-secondary' : 'text-on-surface-variant'
                }`}
                style={{ fontVariationSettings: isVerified || isRejected ? "'FILL' 1" : "'FILL' 0" }}
              >
                {copy.icon}
              </span>
            </div>
            <div className="flex-1">
              <h3 className={`mb-0.5 font-body-lg text-body-lg font-semibold ${isVerified ? 'text-primary' : 'text-on-surface'}`}>
                {copy.title}
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">{copy.desc}</p>
            </div>
            <div className="w-full flex-shrink-0 sm:w-auto">
              {isVerified ? (
                <AdultVerifiedBadge />
              ) : (
                <button
                  type="button"
                  onClick={() => navigate(isRejected ? '/kyc/rejected' : '/kyc')}
                  className={`w-full rounded-full px-5 py-2.5 font-label-caps text-label-caps font-semibold transition-all duration-200 sm:w-auto ${
                    isRejected
                      ? 'border border-outline-variant bg-surface-bright text-on-surface hover:bg-surface-variant hover:text-primary'
                      : isReview
                        ? 'border border-outline bg-transparent text-secondary hover:bg-surface-variant/50'
                        : 'bg-gradient-to-r from-primary-container to-secondary-container text-on-primary shadow-[0_4px_14px_rgba(255,71,155,0.2)] hover:scale-[1.02] hover:shadow-[0_6px_20px_rgba(255,71,155,0.3)]'
                  }`}
                >
                  {copy.cta}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
