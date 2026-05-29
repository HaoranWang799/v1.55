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

const supportedRegions = [
  { code: 'US', flag: '🇺🇸', name: 'United States', nameZh: '美国' },
  { code: 'JP', flag: '🇯🇵', name: 'Japan', nameZh: '日本' },
  { code: 'DE', flag: '🇩🇪', name: 'Germany', nameZh: '德国' },
  { code: 'FR', flag: '🇫🇷', name: 'France', nameZh: '法国' },
  { code: 'NL', flag: '🇳🇱', name: 'Netherlands', nameZh: '荷兰' },
  { code: 'CA', flag: '🇨🇦', name: 'Canada', nameZh: '加拿大' },
  { code: 'AU', flag: '🇦🇺', name: 'Australia', nameZh: '澳大利亚' },
  { code: 'SG', flag: '🇸🇬', name: 'Singapore', nameZh: '新加坡' },
  { code: 'GB', flag: '🇬🇧', name: 'United Kingdom', nameZh: '英国' },
]

const restrictedRegions = [
  { code: 'CN', flag: '🇨🇳', name: 'Mainland China', nameZh: '中国大陆' },
  { code: 'SA', flag: '🇸🇦', name: 'Saudi Arabia', nameZh: '沙特阿拉伯' },
  { code: 'AE', flag: '🇦🇪', name: 'UAE', nameZh: '阿联酋' },
  { code: 'QA', flag: '🇶🇦', name: 'Qatar', nameZh: '卡塔尔' },
  { code: 'KW', flag: '🇰🇼', name: 'Kuwait', nameZh: '科威特' },
]

const complianceItems = [
  { icon: '18_up_rating', en: '18+ Verification', zh: '18+ 验证' },
  { icon: 'badge', en: 'ID Verification', zh: '身份证明验证' },
  { icon: 'face', en: 'Selfie Match', zh: '自拍匹配' },
  { icon: 'contract', en: 'Terms Acceptance', zh: '条款接受' },
  { icon: 'public', en: 'Region Eligibility', zh: '地区合规' },
]

const privacyItems = [
  { icon: 'enhanced_encryption', en: 'End-to-End Encrypted', zh: '端到端加密' },
  { icon: 'gavel', en: 'Compliance Use Only', zh: '仅供合规使用' },
  { icon: 'auto_delete', en: 'Auto Deleted After Review', zh: '审核后自动删除' },
  { icon: 'verified_user', en: 'GDPR Privacy Standards', zh: 'GDPR 隐私标准' },
]

export default function KycStatusHubPage() {
  const navigate = useNavigate()
  const { lang } = useApp()
  const status = getKycStatus()
  const T = lang === 'en' ? en : zh
  const current = T[status]
  const currentIcon = icons[status]
  const currentPath = ctaPaths[status]
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

        {/* ── Regional Access & Compliance Center ── */}
        <section className="space-y-stack-lg">
          <div className="mb-stack-md flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-primary-container">public</span>
            <h2 className="font-headline-md text-headline-md text-on-surface">
              {lang === 'en' ? 'Regional Access & Compliance Center' : '地区访问与合规中心'}
            </h2>
          </div>

          {/* 1. Current Region */}
          <div className="rounded-xl border border-white/10 bg-cyber-gradient p-4">
            <span className="font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant">
              {lang === 'en' ? 'Current Region' : '当前地区'}
            </span>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-[#00E676]/30 bg-[#00E676]/10 text-lg font-bold text-[#00E676] shadow-[0_0_12px_rgba(0,230,118,0.2)]">
                US
              </div>
              <div className="flex-1">
                <p className="font-body-lg text-body-lg font-semibold text-on-surface">
                  {lang === 'en' ? 'United States' : '美国'}
                </p>
                <p className="font-label-caps text-label-caps text-on-surface-variant">
                  {lang === 'en' ? 'Region detected via secure lookup' : '通过安全查询检测地区'}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#00E676]/30 bg-[#00E676]/10 px-3 py-1 font-label-caps text-[10px] text-[#00E676]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00E676] shadow-[0_0_6px_#00E676]" />
                {lang === 'en' ? 'Supported' : '支持'}
              </span>
            </div>
          </div>

          {/* 2. Supported Regions */}
          <div className="rounded-xl border border-white/10 bg-cyber-gradient p-4">
            <span className="font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant">
              {lang === 'en' ? 'Supported Regions' : '支持地区'}
            </span>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {supportedRegions.map((r) => (
                <div
                  key={r.code}
                  className="flex items-center gap-2 rounded-lg border border-[#00E676]/20 bg-[#00E676]/5 px-2.5 py-2 transition-all hover:border-[#00E676]/40 hover:bg-[#00E676]/10"
                >
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border border-[#00E676]/30 bg-[#00E676]/10 text-[10px] font-bold text-[#00E676]">
                    {r.code}
                  </span>
                  <span className="font-label-caps text-[10px] text-on-surface-variant truncate">
                    {lang === 'en' ? r.name : r.nameZh}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Restricted Regions */}
          <div className="rounded-xl border border-white/10 bg-cyber-gradient p-4">
            <span className="font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant">
              {lang === 'en' ? 'Restricted Regions' : '限制地区'}
            </span>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {restrictedRegions.map((r) => (
                <div
                  key={r.code}
                  className="flex items-center gap-2 rounded-lg border border-error/20 bg-error/5 px-2.5 py-2 transition-all hover:border-error/40 hover:bg-error/10"
                >
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border border-error/30 bg-error/10 text-[10px] font-bold text-error">
                    {r.code}
                  </span>
                  <span className="font-label-caps text-[10px] text-on-surface-variant truncate">
                    {lang === 'en' ? r.name : r.nameZh}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Compliance Requirements */}
          <div className="rounded-xl border border-white/10 bg-cyber-gradient p-4">
            <span className="font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant">
              {lang === 'en' ? 'Compliance Requirements' : '合规要求'}
            </span>
            <div className="mt-3 space-y-2">
              {complianceItems.map((item) => (
                <div key={item.en} className="flex items-center gap-3 rounded-lg border border-white/5 bg-surface-container-low px-3 py-2.5">
                  <span className="material-symbols-outlined text-[18px] text-primary-container">{item.icon}</span>
                  <span className="font-body-sm text-body-sm text-on-surface">{lang === 'en' ? item.en : item.zh}</span>
                  <span className="ml-auto material-symbols-outlined text-[16px] text-[#00E676]">check_circle</span>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Privacy & Protection */}
          <div className="rounded-xl border border-white/10 bg-cyber-gradient p-4">
            <span className="font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant">
              {lang === 'en' ? 'Privacy & Protection' : '隐私与保护'}
            </span>
            <div className="mt-3 space-y-2">
              {privacyItems.map((item) => (
                <div key={item.en} className="flex items-center gap-3 rounded-lg border border-white/5 bg-surface-container-low px-3 py-2.5">
                  <span className="material-symbols-outlined text-[18px] text-secondary">{item.icon}</span>
                  <span className="font-body-sm text-body-sm text-on-surface">{lang === 'en' ? item.en : item.zh}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 6. World Map Card */}
          <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0a0515] p-5">
            <span className="font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant">
              {lang === 'en' ? 'Global Coverage' : '全球覆盖'}
            </span>
            <div className="mt-3 flex justify-center">
              <div className="relative w-full" style={{ minHeight: '220px' }}>
                <svg viewBox="0 0 400 220" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                  {/* Background grid lines */}
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                    </pattern>
                    <radialGradient id="supportedGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#00E676" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#00E676" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="restrictedGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#ffb4ab" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#ffb4ab" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="currentGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#ff479b" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#ff479b" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <rect width="400" height="220" fill="url(#grid)" />

                  {/* North America */}
                  <circle cx="60" cy="52" r="32" fill="url(#supportedGlow)" />
                  <circle cx="60" cy="52" r="14" fill="none" stroke="rgba(0,230,118,0.5)" strokeWidth="1.5" />
                  <circle cx="60" cy="52" r="5" fill="#00E676">
                    <animate attributeName="opacity" values="0.5;1;0.5" dur="4s" repeatCount="indefinite" />
                  </circle>
                  <text x="60" y="82" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8">N. America</text>

                  {/* Europe */}
                  <circle cx="170" cy="40" r="26" fill="url(#supportedGlow)" />
                  <circle cx="170" cy="40" r="12" fill="none" stroke="rgba(0,230,118,0.5)" strokeWidth="1.5" />
                  <circle cx="170" cy="40" r="4" fill="#00E676">
                    <animate attributeName="opacity" values="0.4;0.9;0.4" dur="5s" repeatCount="indefinite" />
                  </circle>
                  <text x="170" y="62" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8">Europe</text>

                  {/* Asia */}
                  <circle cx="275" cy="58" r="30" fill="url(#restrictedGlow)" />
                  <circle cx="275" cy="58" r="14" fill="none" stroke="rgba(255,180,171,0.5)" strokeWidth="1.5" strokeDasharray="4 2" />
                  <circle cx="275" cy="58" r="4" fill="#ffb4ab">
                    <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <text x="275" y="88" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8">Asia</text>

                  {/* Japan dot */}
                  <circle cx="310" cy="38" r="3" fill="#00E676" opacity="0.8">
                    <animate attributeName="opacity" values="0.3;0.9;0.3" dur="3s" repeatCount="indefinite" />
                  </circle>

                  {/* Middle East */}
                  <circle cx="230" cy="72" r="12" fill="url(#restrictedGlow)" />
                  <circle cx="230" cy="72" r="6" fill="none" stroke="rgba(255,180,171,0.4)" strokeWidth="1" strokeDasharray="3 2" />
                  <circle cx="230" cy="72" r="2.5" fill="#ffb4ab" opacity="0.8" />

                  {/* South America */}
                  <circle cx="95" cy="140" r="16" fill="url(#supportedGlow)" />
                  <circle cx="95" cy="140" r="8" fill="none" stroke="rgba(0,230,118,0.4)" strokeWidth="1" />
                  <circle cx="95" cy="140" r="3" fill="#00E676" opacity="0.6" />
                  <text x="95" y="165" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="7">S. America</text>

                  {/* Africa */}
                  <circle cx="185" cy="112" r="18" fill="url(#supportedGlow)" />
                  <circle cx="185" cy="112" r="9" fill="none" stroke="rgba(0,230,118,0.4)" strokeWidth="1" />
                  <circle cx="185" cy="112" r="3" fill="#00E676" opacity="0.5" />
                  <text x="185" y="138" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="7">Africa</text>

                  {/* Australia */}
                  <circle cx="330" cy="155" r="14" fill="url(#supportedGlow)" />
                  <circle cx="330" cy="155" r="7" fill="none" stroke="rgba(0,230,118,0.4)" strokeWidth="1" />
                  <circle cx="330" cy="155" r="3" fill="#00E676" opacity="0.6" />
                  <text x="330" y="178" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="7">Australia</text>

                  {/* Current region - pink pulse glow (USA) */}
                  <circle cx="60" cy="52" r="38" fill="none" stroke="rgba(255,71,155,0.5)" strokeWidth="2">
                    <animate attributeName="r" values="32;42;32" dur="2.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0.15;0.8" dur="2.5s" repeatCount="indefinite" />
                  </circle>

                  {/* Connection lines */}
                  <line x1="60" y1="52" x2="170" y2="40" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
                  <line x1="170" y1="40" x2="275" y2="58" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />
                  <line x1="275" y1="58" x2="310" y2="38" stroke="rgba(255,255,255,0.05)" strokeWidth="0.6" />
                  <line x1="170" y1="40" x2="185" y2="112" stroke="rgba(255,255,255,0.05)" strokeWidth="0.6" />
                  <line x1="185" y1="112" x2="275" y2="58" stroke="rgba(255,255,255,0.05)" strokeWidth="0.6" />
                  <line x1="275" y1="58" x2="330" y2="155" stroke="rgba(255,255,255,0.04)" strokeWidth="0.6" />
                  <line x1="60" y1="52" x2="95" y2="140" stroke="rgba(255,255,255,0.05)" strokeWidth="0.6" />
                  <line x1="185" y1="112" x2="95" y2="140" stroke="rgba(255,255,255,0.04)" strokeWidth="0.6" />
                </svg>

                {/* Legend */}
                <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-5">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#00E676] shadow-[0_0_6px_#00E676]" />
                    <span className="font-label-caps text-[9px] text-on-surface-variant">{lang === 'en' ? 'Supported' : '支持'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#ffb4ab] shadow-[0_0_6px_#ffb4ab]" />
                    <span className="font-label-caps text-[9px] text-on-surface-variant">{lang === 'en' ? 'Restricted' : '限制'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#ff479b] shadow-[0_0_8px_#ff479b] animate-pulse" />
                    <span className="font-label-caps text-[9px] text-on-surface-variant">{lang === 'en' ? 'You' : '当前'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
