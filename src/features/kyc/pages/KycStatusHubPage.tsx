import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../../context/AppContext'
import { getKycStatus } from '../mockKycData'
import { KycTopBar } from '../components/KycProgress'
import type { KycStatus } from '../types'
import AdultVerifiedBadge from '../components/AdultVerifiedBadge'

type StatusTexts = { title: string; desc: string; cta: string }

const zh: Record<KycStatus, StatusTexts> = {
  not_verified: { title: '成人访问已锁定', desc: '验证您的身份以解锁 18+ 内容和功能。', cta: '立即验证' },
  under_review: { title: '审核进行中', desc: '您的文件正在审核中，完成后将通知您。', cta: '查看状态' },
  verified: { title: '成人访问已启用', desc: '身份已确认，所有限制已解除。', cta: '查看详情' },
  rejected: { title: '验证需要重新提交', desc: '图片质量过低，请重新提交清晰照片。', cta: '重新提交' },
}

const en: Record<KycStatus, StatusTexts> = {
  not_verified: { title: 'Adult Access Locked', desc: 'Verify your identity to unlock 18+ content and features.', cta: 'Verify Now' },
  under_review: { title: 'Review in Progress', desc: "Your documents are currently being analyzed. We'll notify you once complete.", cta: 'View Status' },
  verified: { title: 'Adult Access Enabled', desc: 'Identity confirmed. All restrictions lifted.', cta: 'View Details' },
  rejected: { title: 'Verification Needs Review', desc: 'Image quality was too low. Please resubmit clearer photos.', cta: 'Resubmit' },
}

const icons: Record<KycStatus, string> = { not_verified: 'lock', under_review: 'hourglass_top', verified: 'verified', rejected: 'error' }
const ctaPaths: Record<KycStatus, string> = { not_verified: '/kyc/step1', under_review: '/kyc/step1', verified: '/kyc/step1', rejected: '/kyc/identity' }

const zhVariants = ['已锁定 — 未验证', '处理中 — 审核中', '已激活 — 已验证', '需要操作 — 被拒绝']
const enVariants = ['Locked — Not Verified', 'Processing — Under Review', 'Active — Verified', 'Action Needed — Rejected']

export default function KycStatusHubPage() {
  const navigate = useNavigate()
  const { lang } = useApp()
  const status = getKycStatus()
  const [showAll, setShowAll] = useState(false)
  const T = lang === 'en' ? en : zh
  const current = T[status]
  const currentIcon = icons[status]
  const currentPath = ctaPaths[status]
  const variantLabels = lang === 'en' ? enVariants : zhVariants
  const isVerified = status === 'verified'
  const isRejected = status === 'rejected'
  const isReview = status === 'under_review'

  return (
    <div className="min-h-screen bg-background font-body-lg text-on-background antialiased selection:bg-primary-container selection:text-on-primary-container">
      <KycTopBar onBack={() => navigate('/profile')} />

      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-[10%] -top-[10%] h-[50vw] w-[50vw] rounded-full bg-primary-container/10 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[40vw] w-[40vw] rounded-full bg-secondary-container/10 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[480px] px-container-margin py-section-gap">
        <header className="mb-section-gap text-center">
          <div className="mb-stack-md inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-cyber-gradient">
            <span className="material-symbols-outlined text-primary-container">shield_person</span>
          </div>
          <h1 className="mb-stack-sm font-display-lg text-display-lg tracking-tight text-on-surface">{lang === 'en' ? 'Identity Verification' : '身份验证'}</h1>
          <p className="mx-auto max-w-xl font-body-lg text-body-lg text-on-surface-variant">
            {lang === 'en' ? 'Secure your experience. Manage your identity verification status and access.' : '保障您的体验安全。管理您的身份验证状态与访问权限。'}
          </p>
        </header>

        {/* ── 当前状态卡片 ── */}
        <section className="mb-stack-lg">
          <span className="mb-stack-sm block pl-1 font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">
            {lang === 'en' ? 'Current Status' : '当前状态'}
          </span>
          <div className="relative">
            {isVerified && <div className="pointer-events-none absolute inset-0 rounded-xl bg-primary-container/20 blur-xl animate-subtlePulse" />}
            {isReview && (
              <div className="absolute left-0 top-0 z-20 h-0.5 w-full overflow-hidden rounded-t-xl bg-surface-variant">
                <div className="h-full w-1/3 rounded-r-full bg-primary-container animate-pulse" />
              </div>
            )}
            <div
              className={`relative overflow-hidden rounded-xl border transition-all duration-300 ${
                isVerified
                  ? 'border-primary-container/50 bg-cyber-gradient shadow-lg backdrop-blur-sm'
                  : isRejected
                    ? 'border-error/30 bg-cyber-gradient'
                    : isReview
                      ? 'border-white/10 bg-cyber-gradient'
                      : 'border-white/10 bg-cyber-gradient'
              }`}
            >
              <div className="flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center">
                <div
                  className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border ${
                    isVerified
                      ? 'border-primary-container/30 bg-primary-container/10'
                      : isRejected
                        ? 'border-error/20 bg-error/10'
                        : 'border-white/10 bg-surface-container-low'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined ${
                      isVerified ? 'text-primary-container' : isRejected ? 'text-error' : isReview ? 'text-secondary' : 'text-on-surface-variant'
                    }`}
                    style={{ fontVariationSettings: isVerified || isRejected ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {currentIcon}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className={`mb-0.5 font-body-lg text-body-lg font-semibold ${isVerified ? 'text-primary' : 'text-on-surface'}`}>
                    {current.title}
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{current.desc}</p>
                </div>
                <div className="w-full flex-shrink-0 sm:w-auto">
                  {isVerified ? (
                    <AdultVerifiedBadge />
                  ) : (
                    <button
                      type="button"
                      onClick={() => navigate(currentPath)}
                      className={`w-full rounded-full px-5 py-2.5 font-label-caps text-label-caps font-semibold transition-all duration-200 sm:w-auto ${
                        isRejected
                          ? 'border border-white/10 bg-surface-container-low text-on-surface hover:bg-surface-container-high hover:text-primary'
                          : isReview
                            ? 'border border-white/10 bg-transparent text-secondary hover:bg-surface-container-low/50'
                            : 'bg-gradient-to-r from-primary-container to-secondary-container text-white shadow-[0_4px_14px_rgba(255,71,155,0.2)] hover:scale-[1.02] hover:shadow-[0_6px_20px_rgba(255,71,155,0.3)]'
                      }`}
                    >
                      {current.cta}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 所有状态预览（折叠） ── */}
        <section>
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="mb-stack-md flex w-full items-center justify-between rounded-lg border border-white/10 bg-cyber-gradient px-4 py-3 font-label-caps text-label-caps text-on-surface-variant transition-colors hover:border-white/20"
          >
            <span>{lang === 'en' ? 'All States (Demo Preview)' : '全部状态（演示预览）'}</span>
            <span className={`material-symbols-outlined text-[16px] transition-transform ${showAll ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>

          {showAll && (
            <div className="grid grid-cols-1 gap-stack-lg">
              {/* not_verified */}
              <div className="flex flex-col gap-stack-sm">
                <span className="pl-1 font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">
                  {variantLabels[0]}
                </span>
                <div className="relative overflow-hidden rounded-xl border border-white/10 bg-cyber-gradient transition-all duration-300 hover:border-white/20">
                  <div className="flex flex-col items-start gap-4 p-5">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-white/10 bg-surface-container-low">
                      <span className="material-symbols-outlined text-on-surface-variant">lock</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-0.5 font-body-lg text-body-lg font-semibold text-on-surface">{T.not_verified.title}</h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">{T.not_verified.desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/kyc/step1')}
                      className="w-full rounded-full bg-gradient-to-r from-primary-container to-secondary-container px-5 py-2.5 font-label-caps text-label-caps font-semibold text-white shadow-[0_4px_14px_0_rgba(255,71,155,0.2)] transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_6px_20px_rgba(255,71,155,0.3)]"
                    >
                      {T.not_verified.cta}
                    </button>
                  </div>
                </div>
              </div>

              {/* under_review */}
              <div className="flex flex-col gap-stack-sm">
                <span className="pl-1 font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">
                  {variantLabels[1]}
                </span>
                <div className="relative overflow-hidden rounded-xl border border-white/10 bg-cyber-gradient transition-all duration-300 hover:border-white/20">
                  <div className="absolute left-0 top-0 h-0.5 w-full bg-surface-variant">
                    <div className="h-full w-1/3 rounded-r-full bg-primary-container animate-pulse" />
                  </div>
                  <div className="flex flex-col items-start gap-4 p-5">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-white/10 bg-surface-container-low">
                      <span className="material-symbols-outlined text-secondary">hourglass_top</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-0.5 font-body-lg text-body-lg font-semibold text-on-surface">{T.under_review.title}</h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">{T.under_review.desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/kyc/step1')}
                      className="w-full rounded-full border border-outline bg-transparent px-5 py-2.5 font-label-caps text-label-caps font-semibold text-secondary transition-colors duration-200 hover:bg-surface-variant/50"
                    >
                      {T.under_review.cta}
                    </button>
                  </div>
                </div>
              </div>

              {/* verified */}
              <div className="flex flex-col gap-stack-sm">
                <span className="pl-1 font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">
                  {variantLabels[2]}
                </span>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-0 rounded-xl bg-primary-container/20 blur-xl animate-subtlePulse" />
                  <button
                    type="button"
                    onClick={() => navigate('/kyc/step1')}
                    className="relative w-full overflow-hidden rounded-xl border border-primary-container/50 bg-cyber-gradient text-left shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-primary-container/70"
                  >
                    <div className="flex flex-col items-start gap-4 p-5">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-primary-container/30 bg-primary-container/10">
                        <span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                          verified
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="mb-0.5 font-body-lg text-body-lg font-semibold text-primary">{T.verified.title}</h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">{T.verified.desc}</p>
                      </div>
                      <AdultVerifiedBadge />
                    </div>
                  </button>
                </div>
              </div>

              {/* rejected */}
              <div className="flex flex-col gap-stack-sm">
                <span className="pl-1 font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">
                  {variantLabels[3]}
                </span>
                <div className="relative overflow-hidden rounded-xl border border-white/10 bg-cyber-gradient transition-all duration-300 hover:border-error/30">
                  <div className="flex flex-col items-start gap-4 p-5">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-error/20 bg-error/10">
                      <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>
                        error
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-0.5 font-body-lg text-body-lg font-semibold text-on-surface">{T.rejected.title}</h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">{T.rejected.desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/kyc/identity')}
                      className="w-full rounded-full border border-outline-variant bg-surface-bright px-5 py-2.5 font-label-caps text-label-caps font-semibold text-on-surface transition-colors duration-200 hover:bg-surface-variant hover:text-primary"
                    >
                      {T.rejected.cta}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
