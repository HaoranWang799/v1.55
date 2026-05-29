import { useNavigate } from 'react-router-dom'
import { useApp } from '../../../context/AppContext'
import { getKycStatus } from '../mockKycData'
import type { KycStatus } from '../types'
import AdultVerifiedBadge from './AdultVerifiedBadge'

type Props = {
  className?: string
}

const zhContent: Record<KycStatus, { title: string; desc: string; cta: string }> = {
  not_verified: {
    title: '成人访问已锁定',
    desc: '验证您的身份以解锁 18+ 内容和功能。',
    cta: '立即验证',
  },
  under_review: {
    title: '审核进行中',
    desc: '您的文件正在审核中，请耐心等待。',
    cta: '查看状态',
  },
  verified: {
    title: '成人访问已启用',
    desc: '身份已确认，所有限制已解除。',
    cta: '查看状态',
  },
  rejected: {
    title: '验证需要重新提交',
    desc: '图片质量过低，请重新提交清晰照片。',
    cta: '重新提交',
  },
}

const enContent: Record<KycStatus, { title: string; desc: string; cta: string }> = {
  not_verified: {
    title: 'Adult Access Locked',
    desc: 'Verify your identity to unlock 18+ content and features.',
    cta: 'Verify Now',
  },
  under_review: {
    title: 'Review in Progress',
    desc: 'Your documents are currently being analyzed.',
    cta: 'View Status',
  },
  verified: {
    title: 'Adult Access Enabled',
    desc: 'Identity confirmed. All restrictions lifted.',
    cta: 'View Status',
  },
  rejected: {
    title: 'Verification Needs Review',
    desc: 'Image quality was too low. Please try again.',
    cta: 'Resubmit',
  },
}

const statusIcons: Record<KycStatus, string> = {
  not_verified: 'lock',
  under_review: 'hourglass_top',
  verified: 'verified',
  rejected: 'error',
}

export default function KycStatusCard({ className = '' }: Props) {
  const navigate = useNavigate()
  const { lang } = useApp()
  const status = getKycStatus()
  const T = lang === 'en' ? enContent : zhContent
  const copy = T[status]
  const icon = statusIcons[status]
  const isVerified = status === 'verified'
  const isRejected = status === 'rejected'
  const isReview = status === 'under_review'
  const targetPath = '/kyc'

  return (
    <div className={`${className}`}>
      <div className="relative">
        {isVerified ? <div className="pointer-events-none absolute inset-0 rounded-xl bg-primary-container/20 blur-xl animate-subtlePulse" /> : null}
        {isReview ? (
          <div className="absolute left-0 top-0 z-20 h-0.5 w-full overflow-hidden rounded-t-xl bg-surface-variant">
            <div className="h-full w-1/3 rounded-r-full bg-primary-container animate-pulse" />
          </div>
        ) : null}
        <div
          className={`relative overflow-hidden rounded-2xl border bg-[#1E1324]/80 backdrop-blur-md transition-all duration-300 ${
            isVerified
              ? 'cursor-pointer border-primary-container/40 shadow-lg hover:border-primary-container/60'
              : isRejected
                ? 'border-error/30 hover:border-error/50'
                : 'border-[#FF7DAF]/10 hover:border-[#FF7DAF]/20'
          }`}
          onClick={isVerified ? () => navigate(targetPath) : undefined}
        >
          <div className="flex items-center gap-3 p-3">
            <div
              className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border ${
                isVerified
                  ? 'border-primary-container/30 bg-primary-container/10'
                  : isRejected
                    ? 'border-error/20 bg-error/10'
                    : 'border-[#FF7DAF]/15 bg-[#FF7DAF]/5'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[20px] ${
                  isVerified ? 'text-primary-container' : isRejected ? 'text-error' : isReview ? 'text-secondary' : 'text-[#A87CFF]'
                }`}
                style={{ fontVariationSettings: isVerified || isRejected ? "'FILL' 1" : "'FILL' 0" }}
              >
                {icon}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`font-body-sm text-body-sm font-semibold ${isVerified ? 'text-primary' : 'text-[#F9EDF5]'}`}>
                {copy.title}
              </h3>
              <p className="font-label-caps text-[11px] text-[#9B859D] leading-snug">{copy.desc}</p>
            </div>
            {isVerified ? (
              <button
                type="button"
                onClick={() => navigate(targetPath)}
                className="flex-shrink-0 rounded-lg transition-transform hover:scale-[1.02] active:scale-[0.99]"
              >
                <AdultVerifiedBadge />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate(targetPath)}
                className={`flex-shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all duration-200 ${
                  isRejected
                    ? 'border border-[#FF7DAF]/20 bg-[#FF7DAF]/5 text-[#FF7DAF] hover:bg-[#FF7DAF]/10'
                    : isReview
                      ? 'border border-[#FF7DAF]/20 bg-transparent text-[#A87CFF] hover:bg-[#FF7DAF]/5'
                      : 'border border-[#A87CFF]/30 bg-[#A87CFF]/10 text-[#A87CFF] hover:bg-[#A87CFF]/15'
                }`}
              >
                {copy.cta}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
