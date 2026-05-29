import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DocumentUploadBox from '../components/DocumentUploadBox'
import { KycTopBar } from '../components/KycProgress'
import { getKycIdentityDraft, setKycIdentityDraft, uploadKycDocument } from '../mockKycData'
import type { DocumentType, KycIdentityDraft } from '../types'

const documentOptions: { id: DocumentType; label: string; icon: string }[] = [
  { id: 'id_card', label: 'ID CARD', icon: 'badge' },
  { id: 'passport', label: 'PASSPORT', icon: 'menu_book' },
  { id: 'driver_license', label: 'DRIVER\nLICENSE', icon: 'directions_car' },
]

export default function KycIdentityPage() {
  const navigate = useNavigate()
  const [draft, setDraft] = useState<KycIdentityDraft>(() => getKycIdentityDraft())

  const canContinue = useMemo(() => {
    if (!draft.selfieCompleted) return false
    if (draft.documentType === 'passport') return draft.passportUploaded
    return draft.frontUploaded && draft.backUploaded
  }, [draft])

  function updateDraft(next: KycIdentityDraft) {
    setDraft(next)
    setKycIdentityDraft(next)
  }

  function chooseDocument(documentType: DocumentType) {
    updateDraft({ ...draft, documentType })
  }

  async function markUploaded(side: 'front' | 'back' | 'passport' | 'selfie') {
    await uploadKycDocument({ documentType: draft.documentType, side })
    updateDraft({
      ...draft,
      frontUploaded: side === 'front' ? true : draft.frontUploaded,
      backUploaded: side === 'back' ? true : draft.backUploaded,
      passportUploaded: side === 'passport' ? true : draft.passportUploaded,
      selfieCompleted: side === 'selfie' ? true : draft.selfieCompleted,
    })
  }

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-[480px] flex-col bg-[#0D0118] pb-[100px] font-sans text-on-surface">
      <div className="pointer-events-none fixed left-1/2 top-0 z-0 h-[300px] w-full max-w-[480px] -translate-x-1/2 bg-primary-container/10 blur-[100px]" />
      <KycTopBar onBack={() => navigate('/kyc/step1')} />

      <div className="z-10 flex flex-1 flex-col gap-stack-lg px-container-margin pt-stack-md">
        <section className="flex flex-col gap-stack-sm">
          <h2 className="font-display-lg text-display-lg text-on-surface">Verify Your Identity</h2>
          <p className="font-body-sm text-on-surface-variant">Upload a valid document and complete a quick selfie check.</p>
          <p className="font-chinese-sub text-on-surface-variant/70">请上传有效证件，并完成本人验证。</p>
        </section>

        <section className="flex flex-col gap-stack-md">
          <div className="-mx-container-margin flex snap-x items-center gap-gutter overflow-x-auto px-container-margin pb-2 scrollbar-hide">
            {documentOptions.map((option) => {
              const active = draft.documentType === option.id
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => chooseDocument(option.id)}
                  className={`relative flex h-[100px] w-[120px] flex-shrink-0 snap-start flex-col items-center justify-center gap-stack-sm overflow-hidden rounded-xl border transition-all duration-300 ${
                    active
                      ? 'border-primary bg-gradient-to-b from-[#1a0826] to-black shadow-[0_0_15px_rgba(255,71,155,0.4)]'
                      : 'border-white/10 bg-surface-container text-on-surface-variant hover:border-white/30 hover:text-on-surface'
                  }`}
                >
                  <div className="absolute inset-0 bg-primary/10 opacity-0 transition-opacity group-hover:opacity-100" />
                  <span
                    className={`material-symbols-outlined text-[32px] ${active ? 'text-primary drop-shadow-[0_0_8px_rgba(255,176,202,0.8)]' : ''}`}
                    style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {option.icon}
                  </span>
                  <span className={`whitespace-pre-line px-2 text-center font-label-caps text-label-caps ${active ? 'text-primary' : ''}`}>
                    {option.label}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        <section className="flex flex-col gap-stack-md">
          <div className="grid grid-cols-2 gap-gutter">
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
          </div>
          <div className="flex items-start gap-stack-sm rounded-lg border border-secondary/20 bg-secondary-container/10 p-stack-sm backdrop-blur-sm">
            <span className="material-symbols-outlined mt-0.5 text-[20px] text-secondary">lightbulb</span>
            <p className="font-chinese-sub text-chinese-sub leading-tight text-secondary/90">
              Ensure all details are clearly legible. Avoid glare, reflections, and dark shadows. Place the document on a dark, flat surface.
            </p>
          </div>
        </section>

        <section className="flex flex-col gap-stack-md">
          <h3 className="font-headline-md text-body-lg text-on-surface">Selfie Check</h3>
          <button
            type="button"
            onClick={() => markUploaded('selfie')}
            className="relative flex flex-col items-center justify-center overflow-hidden rounded-[24px] border border-white/5 bg-gradient-to-br from-surface-container-low to-black p-stack-md py-stack-lg shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)]"
          >
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px] opacity-[0.03]" />
            <div className="relative flex h-[240px] w-[180px] items-center justify-center overflow-hidden rounded-[100px] border-[3px] border-primary/40 bg-black/40 shadow-[0_0_30px_rgba(255,71,155,0.2)] backdrop-blur-md">
              <span className="material-symbols-outlined text-[140px] text-white/10" style={{ fontVariationSettings: "'FILL' 1" }}>
                person
              </span>
              {!draft.selfieCompleted ? (
                <div className="absolute left-0 right-0 z-10 h-[2px] bg-primary shadow-[0_0_10px_#ff479b,0_0_20px_#ff479b] animate-scan" />
              ) : null}
            </div>
            <div className="mt-stack-md flex items-center gap-gutter">
              <div className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_5px_#ffb0ca] animate-pulse" />
                <span className="font-label-caps text-label-caps text-primary">
                  {draft.selfieCompleted ? 'SELFIE COMPLETED' : 'FACE DETECTED'}
                </span>
              </div>
            </div>
          </button>
        </section>
      </div>

      <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 bg-gradient-to-t from-background via-background/90 to-transparent p-container-margin backdrop-blur-md">
        <button
          type="button"
          disabled={!canContinue}
          onClick={() => navigate('/kyc/terms')}
          className={`flex h-14 w-full items-center justify-center gap-2 rounded-full border border-white/5 font-headline-md text-body-lg transition-all ${
            canContinue
              ? 'bg-gradient-to-r from-primary-container to-secondary-container text-white shadow-[0_0_20px_rgba(255,71,155,0.3)] hover:shadow-[0_0_30px_rgba(255,71,155,0.6)] active:scale-[0.99]'
              : 'cursor-not-allowed bg-surface-container-highest text-on-surface-variant opacity-60'
          }`}
        >
          Continue to Terms
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>
      </div>
    </main>
  )
}
