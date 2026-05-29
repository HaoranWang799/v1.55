import { useL } from '../../../i18n/useL'
import type { KycTerm } from '../types'

type Props = {
  term: KycTerm
  checked: boolean
  mandatory?: boolean
  lang?: string
  onToggle: (id: string) => void
}

export default function TermCheckboxCard({ term, checked, mandatory = false, lang = 'zh', onToggle }: Props) {
  const L = useL()
  const isZh = lang !== 'en'
  const displayTitle = isZh && term.titleZh ? term.titleZh : term.title
  const displayDesc = isZh && term.descZh ? term.descZh : term.desc
  return (
    <label
      htmlFor={term.id}
      className={`group relative flex cursor-pointer items-start gap-4 overflow-hidden rounded-xl border p-4 transition-all duration-300 ${
        mandatory ? 'cursor-default' : 'cursor-pointer'
      } ${
        checked
          ? 'border-primary-container/50 bg-primary-container/5'
          : mandatory
            ? 'border-outline-variant/15 bg-surface-container-low'
            : 'border-outline-variant/15 bg-surface-container hover:border-outline-variant/30 hover:bg-surface-container-high'
      }`}
    >
      <input
        id={term.id}
        type="checkbox"
        checked={checked}
        onChange={() => onToggle(term.id)}
        disabled={mandatory}
        className="sr-only"
      />
      {checked && <div className="pointer-events-none absolute inset-0 bg-primary-container/5" />}
      <div className="relative mt-0.5 flex-shrink-0">
        <div
          className={`flex h-6 w-6 items-center justify-center rounded border transition-all duration-200 ${
            checked
              ? 'border-primary-container bg-primary-container shadow-[0_0_12px_rgba(255,71,155,0.4)]'
              : mandatory
                ? 'border-outline-variant/30 bg-surface-container-lowest'
                : 'border-outline-variant/30 bg-surface-container-lowest group-hover:border-outline-variant'
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
          <h3 className="font-body-lg text-body-lg text-on-surface">{displayTitle}</h3>
          {mandatory && (
            <span className="rounded-full border border-primary-container/30 bg-primary-container/10 px-2 py-0.5 font-label-caps text-[10px] text-primary-container">
              {L('必选', 'Required')}
            </span>
          )}
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant/70">{displayDesc}</p>
      </div>
    </label>
  )
}
