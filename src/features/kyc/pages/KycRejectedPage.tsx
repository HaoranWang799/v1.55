import { useNavigate } from 'react-router-dom'
import { setKycStatus } from '../mockKycData'

export default function KycRejectedPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#131313] px-4 py-6 text-[#e2e2e2]">
      <main className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-[480px] flex-col items-center justify-center">
        <div className="w-full rounded-3xl border border-[#93000a]/70 bg-[#2b1719]/85 p-7 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#93000a]/20">
            <span className="material-symbols-outlined text-[34px] text-[#ffb4ab]">error</span>
          </div>
          <h1 className="text-2xl font-bold">Verification Needs Review</h1>
          <p className="mt-2 text-sm text-[#e2bdc7]">Image quality was too low. Please resubmit clearer photos.</p>
          <button
            onClick={() => {
              setKycStatus('rejected')
              navigate('/kyc/identity')
            }}
            className="mt-6 w-full rounded-full border border-[#ffb4ab]/50 bg-[#3a1f22] px-4 py-3 text-sm font-semibold text-[#ffdad6]"
          >
            Resubmit
          </button>
        </div>
      </main>
    </div>
  )
}
