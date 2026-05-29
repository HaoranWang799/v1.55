import type { KycTerm } from '../types'

type Props = {
  term: KycTerm
  checked: boolean
  onToggle: (id: string) => void
}

export default function TermCheckboxCard({ term, checked, onToggle }: Props) {
  return (
    <label
      htmlFor={term.id}
      className={`group relative flex cursor-pointer items-start gap-4 overflow-hidden rounded-xl border p-4 transition-all duration-300 ${
        checked
          ? 'border-primary-container/50 bg-surface-container-high'
          : 'border-outline-variant/20 bg-surface-container hover:border-outline-variant/50 hover:bg-surface-container-high'
      }`}
    >
      <input id={term.id} type="checkbox" checked={checked} onChange={() => onToggle(term.id)} className="sr-only" />
      <div className="pointer-events-none absolute inset-0 bg-primary-container/5 opacity-0 transition-opacity duration-300 group-has-[:checked]:opacity-100" />
      <div className="relative mt-0.5 flex-shrink-0">
        <div
          className={`flex h-6 w-6 items-center justify-center rounded border transition-all duration-200 ${
            checked
              ? 'border-primary-container bg-primary-container shadow-[0_0_12px_rgba(255,71,155,0.4)]'
              : 'border-outline-variant bg-surface-container-lowest group-hover:border-primary/50'
          }`}
        >
          <span
            className={`material-symbols-outlined text-[16px] text-white transition-all duration-200 ${
              checked ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
            }`}
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check
          </span>
        </div>
      </div>
      <div className="relative flex flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-on-surface-variant transition-colors group-hover:text-primary">
            {term.icon}
          </span>
          <h3 className="font-body-lg text-body-lg text-on-surface">{term.title}</h3>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant/70">{term.desc}</p>
      </div>
    </label>
  )
}
