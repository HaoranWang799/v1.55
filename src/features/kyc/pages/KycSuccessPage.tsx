import { useNavigate } from 'react-router-dom'
import { setKycStatus } from '../mockKycData'
import AdultVerifiedBadge from '../components/AdultVerifiedBadge'

export default function KycSuccessPage() {
  const navigate = useNavigate()

  function goProfile() {
    setKycStatus('verified')
    navigate('/profile')
  }

  return (
    <div className="min-h-screen bg-[#131313] px-4 py-6 text-[#e2e2e2]">
      <main className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-[480px] flex-col items-center justify-center">
        <div className="w-full rounded-3xl border border-[#ff479b]/40 bg-[#1b1b1b]/85 p-7 text-center shadow-[0_0_80px_rgba(255,71,155,0.12)]">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#ff479b]/12">
            <span className="material-symbols-outlined text-[34px] text-[#ffb0ca]">verified</span>
          </div>
          <h1 className="text-2xl font-bold">Verification Submitted</h1>
          <p className="mt-2 text-sm text-[#a98892]">Your KYC is under review. We have unlocked verified preview state for UI testing.</p>
          <div className="mt-4"><AdultVerifiedBadge /></div>
          <button onClick={goProfile} className="mt-6 w-full rounded-full bg-gradient-to-r from-[#ff479b] to-[#6e208c] px-4 py-3 text-sm font-semibold text-white">Back to Profile</button>
        </div>
      </main>
    </div>
  )
}
