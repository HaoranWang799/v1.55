import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DocumentUploadBox from '../components/DocumentUploadBox'
import KycProgress from '../components/KycProgress'
import { getKycIdentityDraft, setKycIdentityDraft, uploadKycDocument } from '../mockKycData'
import type { DocumentType, KycIdentityDraft } from '../types'

const docOptions: { id: DocumentType; label: string; icon: string }[] = [
  { id: 'id_card', label: 'ID Card', icon: 'badge' },
  { id: 'passport', label: 'Passport', icon: 'menu_book' },
  { id: 'driver_license', label: 'Driver License', icon: 'directions_car' },
]

export default function KycIdentityPage() {
  const navigate = useNavigate()
  const [draft, setDraft] = useState<KycIdentityDraft>(() => getKycIdentityDraft())

  const canContinue = useMemo(() => {
    if (!draft.selfieCompleted) return false
    if (draft.documentType === 'passport') return draft.passportUploaded
    return draft.frontUploaded && draft.backUploaded
  }, [draft])

  async function markUploaded(side: 'front' | 'back' | 'passport' | 'selfie') {
    await uploadKycDocument({ documentType: draft.documentType, side })
    const next = {
      ...draft,
      frontUploaded: side === 'front' ? true : draft.frontUploaded,
      backUploaded: side === 'back' ? true : draft.backUploaded,
      passportUploaded: side === 'passport' ? true : draft.passportUploaded,
      selfieCompleted: side === 'selfie' ? true : draft.selfieCompleted,
    }
    setDraft(next)
    setKycIdentityDraft(next)
  }

  function chooseDocument(type: DocumentType) {
    const next = { ...draft, documentType: type }
    setDraft(next)
    setKycIdentityDraft(next)
  }

  return (
    <div className="min-h-screen bg-[#131313] text-[#e2e2e2]">
      <main className="mx-auto w-full max-w-[480px] pb-28">
        <KycProgress currentStep={2} />
        <div className="space-y-5 px-5 pt-5">
          <section>
            <h1 className="text-2xl font-bold">Verify Your Identity</h1>
            <p className="mt-1 text-sm text-[#a98892]">Upload a valid document and complete selfie check.</p>
          </section>

          <section className="flex gap-3 overflow-x-auto pb-1">
            {docOptions.map((opt) => {
              const active = draft.documentType === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => chooseDocument(opt.id)}
                  className={`min-w-[130px] rounded-xl border p-3 text-left transition-all ${active ? 'border-[#ff479b] bg-[#220f1a] shadow-[0_0_20px_rgba(255,71,155,0.25)]' : 'border-[#5a3f48]/45 bg-[#1f1f1f] hover:border-[#a98892]/55'}`}
                >
                  <span className="material-symbols-outlined text-[#ffb0ca]">{opt.icon}</span>
                  <p className="mt-2 text-xs font-semibold">{opt.label}</p>
                </button>
              )
            })}
          </section>

          <section className="grid grid-cols-2 gap-3">
            {draft.documentType === 'passport' ? (
              <div className="col-span-2">
                <DocumentUploadBox label="Passport Photo Page" uploaded={draft.passportUploaded} onUpload={() => markUploaded('passport')} />
              </div>
            ) : (
              <>
                <DocumentUploadBox label="Front Side" uploaded={draft.frontUploaded} onUpload={() => markUploaded('front')} />
                <DocumentUploadBox label="Back Side" uploaded={draft.backUploaded} onUpload={() => markUploaded('back')} />
              </>
            )}
          </section>

          <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1b1b1b] to-black p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Selfie Check</h3>
              <span className={`text-xs ${draft.selfieCompleted ? 'text-[#ffb0ca]' : 'text-[#a98892]'}`}>{draft.selfieCompleted ? 'Completed' : 'Pending'}</span>
            </div>
            <div className="relative mx-auto flex h-[210px] w-[150px] items-center justify-center overflow-hidden rounded-[70px] border-2 border-[#ff479b]/45 bg-black/45">
              <span className="material-symbols-outlined text-[84px] text-white/15">person</span>
              {draft.selfieCompleted ? null : <div className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 bg-[#ff479b] shadow-[0_0_14px_rgba(255,71,155,0.8)]" />}
            </div>
            <button
              type="button"
              onClick={() => markUploaded('selfie')}
              className="mt-4 w-full rounded-full border border-[#ff479b]/45 bg-[#ff479b]/10 px-4 py-2.5 text-xs font-semibold text-[#ffb0ca] transition-all hover:bg-[#ff479b]/20 active:scale-[0.99]"
            >
              {draft.selfieCompleted ? 'Selfie Completed' : 'Complete Selfie'}
            </button>
          </section>
        </div>

        <div className="fixed bottom-0 left-1/2 w-full max-w-[480px] -translate-x-1/2 bg-gradient-to-t from-[#131313] via-[#131313]/95 to-transparent p-5">
          <button
            type="button"
            disabled={!canContinue}
            onClick={() => navigate('/kyc/terms')}
            className={`w-full rounded-full px-4 py-3 text-sm font-semibold transition-all ${canContinue ? 'bg-gradient-to-r from-[#ff479b] to-[#6e208c] text-white shadow-[0_6px_24px_rgba(255,71,155,0.35)] hover:opacity-95' : 'cursor-not-allowed bg-[#353535] text-[#a98892]'}`}
          >
            Continue to Terms
          </button>
        </div>
      </main>
    </div>
  )
}
