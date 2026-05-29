import { useNavigate } from 'react-router-dom'
import { useL } from '../../../i18n/useL'
import { setKycStatus } from '../mockKycData'
import AdultVerifiedBadge from '../components/AdultVerifiedBadge'

export default function KycSuccessPage() {
  const navigate = useNavigate()
  const L = useL()

  function goProfile() {
    setKycStatus('under_review')
    navigate('/profile')
  }

  return (
    <div className="min-h-screen bg-background px-container-margin py-6 text-on-surface">
      <main className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-[480px] flex-col items-center justify-center">
        <div className="w-full rounded-3xl border border-primary-container/40 bg-surface-container-low p-7 text-center shadow-[0_0_80px_rgba(255,71,155,0.12)]">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-container/10">
            <span className="material-symbols-outlined text-[34px] text-primary">hourglass_top</span>
          </div>
          <h1 className="font-headline-md text-headline-md font-bold text-on-surface">{L('验证已提交', 'Verification Submitted')}</h1>
          <p className="mt-2 font-body-sm text-body-sm text-on-surface-variant">
            {L('您的文件正在审核中。审核完成后将通知您。', "Your documents are under review. We'll notify you once verification is complete.")}
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 rounded-full border border-outline-variant/30 bg-surface-container-high px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
            <span className="font-label-caps text-label-caps text-on-surface-variant">{L('审核中', 'Under Review')}</span>
          </div>
          <button
            onClick={goProfile}
            className="mt-6 w-full rounded-full bg-gradient-to-r from-primary-container to-secondary-container px-4 py-3 font-label-caps text-label-caps font-semibold text-white shadow-[0_0_20px_rgba(255,71,155,0.3)] transition-all hover:shadow-[0_0_30px_rgba(255,71,155,0.5)] active:scale-[0.99]"
          >
            {L('返回个人中心', 'Back to Profile')}
          </button>
        </div>
      </main>
    </div>
  )
}
