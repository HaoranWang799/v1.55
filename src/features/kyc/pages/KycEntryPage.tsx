import { useNavigate } from 'react-router-dom'

export default function KycEntryPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#0e0e0e] px-4 py-6 text-[#e2e2e2]">
      <main className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-[480px] flex-col justify-center gap-7">
        <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0d0118] to-black p-7 shadow-[0_0_80px_rgba(255,71,155,0.08)]">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[#ff479b]/35 bg-[#ff479b]/10">
            <span className="material-symbols-outlined text-[30px] text-[#ffb0ca]">security</span>
          </div>
          <h1 className="text-center text-3xl font-bold tracking-tight">Adult Access Verification</h1>
          <p className="mt-3 text-center text-sm text-[#a98892]">
            Before entering immersive features, we need to verify you are 18+.
          </p>

          <div className="mt-6 space-y-2 rounded-2xl border border-[#5a3f48]/40 bg-[#1f1f1f]/70 p-4">
            <p className="text-sm text-[#e2bdc7]">18+ only content access</p>
            <p className="text-sm text-[#e2bdc7]">Privacy-protected verification flow</p>
            <p className="text-sm text-[#e2bdc7]">Compliance required</p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/kyc/identity')}
            className="mt-6 w-full rounded-full bg-gradient-to-r from-[#ff479b] to-[#6e208c] px-4 py-3 text-sm font-semibold text-white shadow-[0_6px_24px_rgba(255,71,155,0.35)] transition-all hover:opacity-95 active:scale-[0.99]"
          >
            I am 18+ · Start Verification
          </button>
        </section>
      </main>
    </div>
  )
}
