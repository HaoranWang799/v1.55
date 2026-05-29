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
      className={`group aspect-[4/3] rounded-xl border-2 border-dashed p-3 transition-all ${
        uploaded
          ? 'border-[#ff479b]/60 bg-[#ff479b]/10'
          : 'border-[#5a3f48] bg-black/35 hover:border-[#ff479b]/70 hover:bg-[#ff479b]/8'
      }`}
    >
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2a2a2a]">
          <span className="material-symbols-outlined text-[#ffb0ca]">{uploaded ? 'check_circle' : 'add_photo_alternate'}</span>
        </div>
        <span className="text-xs text-[#e2bdc7]">{uploaded ? `${label} Uploaded` : label}</span>
      </div>
    </button>
  )
}
