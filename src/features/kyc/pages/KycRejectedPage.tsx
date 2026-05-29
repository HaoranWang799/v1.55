import { useNavigate } from 'react-router-dom'
import { useL } from '../../../i18n/useL'

export default function KycRejectedPage() {
  const navigate = useNavigate()
  const L = useL()

  return (
    <div className="min-h-screen bg-background px-container-margin py-6 text-on-surface">
      <main className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-[480px] flex-col items-center justify-center">
        <div className="w-full rounded-3xl border border-error/40 bg-surface-container-low p-7 text-center shadow-[0_0_80px_rgba(147,0,10,0.12)]">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-error-container/20">
            <span className="material-symbols-outlined text-[34px] text-error">error</span>
          </div>
          <h1 className="font-headline-md text-headline-md font-bold text-on-surface">{L('验证需要重新提交', 'Verification Needs Review')}</h1>
          <p className="mt-2 font-body-sm text-body-sm text-on-surface-variant">{L('图片质量过低。请重新提交更清晰的照片。', 'Image quality was too low. Please resubmit clearer photos.')}</p>
          <button
            onClick={() => navigate('/kyc/identity')}
            className="mt-6 w-full rounded-full border border-error/50 bg-error-container/20 px-4 py-3 font-label-caps text-label-caps font-semibold text-on-error-container transition-all hover:bg-error-container/30 active:scale-[0.99]"
          >
            {L('重新提交', 'Resubmit')}
          </button>
        </div>
      </main>
    </div>
  )
}
