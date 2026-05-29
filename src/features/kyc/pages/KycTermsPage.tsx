import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import KycProgress from '../components/KycProgress'
import TermCheckboxCard from '../components/TermCheckboxCard'
import { KYC_TERMS, submitKycTerms, submitKycVerification } from '../mockKycData'

export default function KycTermsPage() {
  const navigate = useNavigate()
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [legalName, setLegalName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const allChecked = useMemo(() => KYC_TERMS.every((t) => checked[t.id]), [checked])
  const canSubmit = allChecked && legalName.trim().length > 2 && !submitting

  function toggleTerm(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  async function onSubmit() {
    if (!canSubmit) return
    setSubmitting(true)
    const accepted = KYC_TERMS.filter((t) => checked[t.id]).map((t) => t.id)
    await submitKycTerms({ legalName: legalName.trim(), acceptedTermIds: accepted })
    const result = await submitKycVerification()
    if (result.status === 'rejected') {
      navigate('/kyc/rejected')
      return
    }
    navigate('/kyc/success')
  }

  return (
    <div className="min-h-screen bg-[#131313] text-[#e2e2e2]">
      <main className="mx-auto w-full max-w-[480px] pb-32">
        <KycProgress currentStep={3} />
        <div className="space-y-5 px-5 pt-5">
          <section>
            <h1 className="text-2xl font-bold">Accept Terms & Submit</h1>
            <p className="mt-1 text-sm text-[#a98892]">Review all terms and sign with your legal name.</p>
          </section>

          <section className="space-y-3">
            {KYC_TERMS.map((term) => (
              <TermCheckboxCard key={term.id} term={term} checked={Boolean(checked[term.id])} onToggle={toggleTerm} />
            ))}
          </section>

          <section className="rounded-2xl border border-[#5a3f48]/45 bg-[#1f1f1f] p-4">
            <h3 className="mb-3 text-sm font-semibold text-[#e2e2e2]">Digital Signature</h3>
            <input
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
              placeholder="Enter your full legal name"
              className="w-full rounded-xl border border-[#5a3f48] bg-[#131313] px-3 py-3 text-sm text-[#e2e2e2] outline-none transition-all placeholder:text-[#a98892] focus:border-[#ff479b]"
            />
            <p className="mt-2 text-[11px] text-[#a98892]">Signed on: {new Date().toLocaleDateString('en-US')}</p>
          </section>
        </div>

        <div className="fixed bottom-0 left-1/2 w-full max-w-[480px] -translate-x-1/2 bg-gradient-to-t from-[#131313] via-[#131313]/95 to-transparent p-5">
          <button
            type="button"
            disabled={!canSubmit}
            onClick={onSubmit}
            className={`w-full rounded-full px-4 py-3 text-sm font-semibold transition-all ${canSubmit ? 'bg-gradient-to-r from-[#ff479b] to-[#6e208c] text-white shadow-[0_6px_24px_rgba(255,71,155,0.35)] hover:opacity-95' : 'cursor-not-allowed bg-[#353535] text-[#a98892]'}`}
          >
            {submitting ? 'Submitting...' : 'Submit Verification'}
          </button>
        </div>
      </main>
    </div>
  )
}
