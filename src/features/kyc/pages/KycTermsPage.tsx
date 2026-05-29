import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../../context/AppContext'
import { useL } from '../../../i18n/useL'
import KycProgress, { KycTopBar } from '../components/KycProgress'
import TermCheckboxCard from '../components/TermCheckboxCard'
import { KYC_TERMS, submitKycTerms, submitKycVerification } from '../mockKycData'

const MANDATORY_TERMS = new Set(['term-age', 'term-virtual'])

export default function KycTermsPage() {
  const navigate = useNavigate()
  const { lang } = useApp()
  const L = useL()
  const [checked, setChecked] = useState<Record<string, boolean>>({
    'term-age': true,
    'term-virtual': true,
  })
  const [legalName, setLegalName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const allChecked = useMemo(() => KYC_TERMS.every((term) => checked[term.id]), [checked])
  const canSubmit = allChecked && legalName.trim().length > 2 && !submitting

  function toggleTerm(id: string) {
    if (MANDATORY_TERMS.has(id)) return
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  async function onSubmit() {
    if (!canSubmit) return
    setSubmitting(true)
    const acceptedTermIds = KYC_TERMS.filter((term) => checked[term.id]).map((term) => term.id)
    await submitKycTerms({ legalName: legalName.trim(), acceptedTermIds })
    const result = await submitKycVerification()
    navigate(result.status === 'rejected' ? '/kyc/rejected' : '/kyc/success')
  }

  return (
    <div className="relative mx-auto min-h-screen max-w-[480px] overflow-hidden bg-surface-container-lowest font-body-lg text-on-background shadow-2xl shadow-black/50">
      <KycTopBar onBack={() => navigate('/kyc/identity')} />
      <KycProgress currentStep={3} />

      <main className="flex flex-col gap-section-gap px-container-margin py-stack-lg pb-40">
        <header className="relative z-10 flex flex-col gap-stack-sm">
          <div className="mb-2 flex w-fit items-center gap-2 rounded-full border border-outline-variant/30 bg-surface-container-high px-3 py-1">
            <span className="material-symbols-outlined text-[14px] text-primary">verified_user</span>
            <span className="font-label-caps text-label-caps text-on-surface-variant">{L('第 3 步 / 共 3 步', 'Step 3 of 3')}</span>
          </div>
          <h2 className="font-display-lg text-display-lg tracking-tight text-on-surface">{L('接受条款并提交', 'Accept Terms & Submit')}</h2>
          <p className="font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
            {L('请审阅并接受以下必要条款以解锁沉浸式功能。', 'Please review and accept the required terms before unlocking immersive features.')}
          </p>
          <p className="mt-1 font-chinese-sub text-chinese-sub text-primary/80">请确认成人访问条款，并提交审核。</p>
        </header>

        <section className="relative z-10 grid grid-cols-1 gap-3">
          {KYC_TERMS.map((term) => (
            <TermCheckboxCard
              key={term.id}
              term={term}
              checked={Boolean(checked[term.id])}
              mandatory={MANDATORY_TERMS.has(term.id)}
              lang={lang}
              onToggle={toggleTerm}
            />
          ))}
        </section>

        <section className="relative z-10 flex flex-col gap-stack-md overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container p-5">
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary-container/10 blur-3xl" />
          <h3 className="flex items-center gap-2 text-[20px] font-semibold text-on-surface">
            <span className="material-symbols-outlined text-primary">draw</span>
            {L('电子签名', 'Digital Signature')}
          </h3>
          <div className="flex flex-col gap-3">
            <div className="group relative">
              <input
                value={legalName}
                onChange={(event) => setLegalName(event.target.value)}
                className="w-full rounded-lg border border-outline-variant/50 bg-surface-container-lowest px-4 py-4 font-body-lg text-on-surface placeholder:text-on-surface-variant/40 transition-all duration-300 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary focus:shadow-[0_0_15px_rgba(255,176,202,0.15)]"
                placeholder={L('请输入您的法定全名', 'Enter your full legal name')}
                type="text"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-focus-within:opacity-100">
                <span className="material-symbols-outlined text-primary">fingerprint</span>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 px-1">
              <div className="flex items-center gap-2 font-chinese-sub text-chinese-sub text-on-surface-variant">
                <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                <span>
                  {L('签署日期：', 'Signed on:')} <span className="font-medium text-on-surface">{new Date().toLocaleDateString(lang === 'en' ? 'en-US' : 'zh-CN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </span>
              </div>
              <div className="text-right text-[10px] uppercase tracking-widest text-outline-variant">{L('已生成加密密钥', 'Encrypted Key Generated')}</div>
            </div>
          </div>
        </section>
      </main>

      <div className="absolute bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-background via-background to-transparent p-container-margin pb-8 pt-12">
        <button
          type="button"
          disabled={!canSubmit}
          onClick={onSubmit}
          className={`flex w-full items-center justify-center gap-2 rounded-full border py-4 font-label-caps text-label-caps transition-all duration-300 ${
            canSubmit
              ? 'cursor-pointer border-transparent bg-gradient-to-r from-primary-container to-secondary-container text-white shadow-[0_0_20px_rgba(255,71,155,0.3)] hover:shadow-[0_0_30px_rgba(255,71,155,0.6)]'
              : 'cursor-not-allowed border-outline-variant/30 bg-surface-container-high text-on-surface-variant opacity-70'
          }`}
        >
          {canSubmit ? (
            <>
              {submitting ? L('提交中...', 'Submitting...') : L('提交验证', 'Submit Verification')}
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">lock</span>
              {L('提交验证', 'Submit Verification')}
            </>
          )}
        </button>
      </div>
    </div>
  )
}
