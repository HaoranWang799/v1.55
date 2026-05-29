import type { KycTerm } from '../types'

type Props = {
  term: KycTerm
  checked: boolean
  onToggle: (id: string) => void
}

export default function TermCheckboxCard({ term, checked, onToggle }: Props) {
  return (
    <button
      type="button"
      onClick={() => onToggle(term.id)}
      className={`w-full rounded-xl border p-4 text-left transition-all ${
        checked
          ? 'border-[#ff479b]/45 bg-[#2a1723] shadow-[0_0_16px_rgba(255,71,155,0.2)]'
          : 'border-[#5a3f48]/40 bg-[#1f1f1f] hover:border-[#a98892]/50'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-1 h-5 w-5 rounded border ${checked ? 'border-[#ff479b] bg-[#ff479b]' : 'border-[#a98892] bg-[#131313]'} flex items-center justify-center`}>
          {checked ? <span className="material-symbols-outlined text-[13px] text-white">check</span> : null}
        </div>
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-[17px] text-[#edb1ff]">{term.icon}</span>
            <h4 className="text-sm font-semibold text-[#e2e2e2]">{term.title}</h4>
          </div>
          <p className="text-xs text-[#a98892]">{term.desc}</p>
        </div>
      </div>
    </button>
  )
}
