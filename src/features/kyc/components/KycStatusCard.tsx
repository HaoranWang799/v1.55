import { useNavigate } from 'react-router-dom'
import { getKycStatus } from '../mockKycData'
import type { KycStatus } from '../types'
import AdultVerifiedBadge from './AdultVerifiedBadge'

type Props = {
  className?: string
}

function statusCopy(status: KycStatus) {
  if (status === 'verified') return { title: 'Adult Access Enabled', desc: 'Identity confirmed. All restrictions lifted.' }
  if (status === 'under_review') return { title: 'Review in Progress', desc: 'Your documents are being analyzed.' }
  if (status === 'rejected') return { title: 'Verification Needs Review', desc: 'Please resubmit with clearer photos.' }
  return { title: 'Adult Access Locked', desc: 'Verify to unlock 18+ content and features.' }
}

export default function KycStatusCard({ className = '' }: Props) {
  const navigate = useNavigate()
  const status = getKycStatus()
  const copy = statusCopy(status)

  const cta = status === 'verified' ? 'View Status' : status === 'rejected' ? 'Resubmit' : status === 'under_review' ? 'Check Progress' : 'Verify Now'

  return (
    <div className={`rounded-2xl border border-[#5a3f48]/40 bg-[#1b1b1b]/85 p-4 backdrop-blur-md ${className}`}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-semibold text-[#e2e2e2]">{copy.title}</h3>
          <p className="mt-1 text-xs text-[#a98892]">{copy.desc}</p>
        </div>
        {status === 'verified' ? <AdultVerifiedBadge status="verified" /> : null}
      </div>
      <button
        type="button"
        onClick={() => navigate(status === 'rejected' ? '/kyc/rejected' : '/kyc')}
        className="w-full rounded-full bg-gradient-to-r from-[#ff479b] to-[#6e208c] px-4 py-2.5 text-xs font-semibold text-white shadow-[0_4px_18px_rgba(255,71,155,0.35)] transition-all hover:opacity-95 active:scale-[0.99]"
      >
        {cta}
      </button>
    </div>
  )
}
