import type { KycStatus } from '../types'

type Props = {
  status: KycStatus
}

const labelMap: Record<KycStatus, string> = {
  not_verified: 'Not Verified',
  under_review: 'Under Review',
  verified: '18+ Verified',
  rejected: 'Rejected',
}

const colorMap: Record<KycStatus, string> = {
  not_verified: 'text-[#e2bdc7] border-[#5a3f48]/60 bg-[#1f1f1f]/70',
  under_review: 'text-[#edb1ff] border-[#6e208c]/50 bg-[#2a1a30]/70',
  verified: 'text-[#ffb0ca] border-[#ff479b]/50 bg-[#2a1723]/70',
  rejected: 'text-[#ffb4ab] border-[#93000a]/60 bg-[#2b1719]/70',
}

export default function AdultVerifiedBadge({ status }: Props) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold border ${colorMap[status]}`}>
      <span className="material-symbols-outlined text-[14px]">verified</span>
      {labelMap[status]}
    </span>
  )
}
