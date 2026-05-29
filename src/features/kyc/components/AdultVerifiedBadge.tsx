type Props = {
  label?: string
}

export default function AdultVerifiedBadge({ label = '18+ Verified' }: Props) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-primary-container/20 bg-primary-container/15 px-3 py-1.5 font-label-caps text-label-caps font-bold text-primary-container">
      <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
        check_circle
      </span>
      {label}
    </span>
  )
}
