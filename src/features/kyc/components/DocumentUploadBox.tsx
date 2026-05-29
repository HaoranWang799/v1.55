type Props = {
  label: string
  uploaded: boolean
  onUpload: () => void
}

export default function DocumentUploadBox({ label, uploaded, onUpload }: Props) {
  return (
    <button
      type="button"
      onClick={onUpload}
      className={`group aspect-[4/3] rounded-xl border-2 border-dashed p-3 transition-colors ${
        uploaded
          ? 'border-primary bg-primary/10'
          : 'border-outline-variant bg-black/50 hover:border-primary hover:bg-primary/5'
      }`}
    >
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high transition-colors group-hover:bg-primary/20">
          <span className="material-symbols-outlined text-on-surface-variant transition-colors group-hover:text-primary">
            {uploaded ? 'check_circle' : 'add_photo_alternate'}
          </span>
        </div>
        <span className="font-body-sm text-body-sm text-on-surface-variant transition-colors group-hover:text-primary">
          {uploaded ? `${label} Uploaded` : label}
        </span>
      </div>
    </button>
  )
}
