import { useL } from '../../../i18n/useL'

type Props = {
  label: string
  uploaded: boolean
  loading?: boolean
  onUpload: () => void
  onRetake?: () => void
}

export default function DocumentUploadBox({ label, uploaded, loading = false, onUpload, onRetake }: Props) {
  const L = useL()
  return (
    <div
      className={`group aspect-[4/3] rounded-xl border-2 border-dashed p-3 transition-all duration-300 ${
        uploaded
          ? 'border-primary bg-primary/10'
          : loading
            ? 'border-secondary/50 bg-secondary/5 scale-[0.98]'
            : 'border-outline-variant bg-black/50 hover:border-primary hover:bg-primary/5'
      }`}
    >
      <div className="flex h-full flex-col items-center justify-center gap-2">
        {loading ? (
          <>
            <div className="flex h-10 w-10 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-secondary border-t-transparent" />
            </div>
            <span className="font-body-sm text-body-sm text-secondary animate-pulse">{L('上传中...', 'Uploading...')}</span>
          </>
        ) : uploaded ? (
          <div className="flex h-full flex-col items-center justify-center gap-1.5">
            <span className="material-symbols-outlined text-[22px] text-primary">check_circle</span>
            <span className="font-label-caps text-label-caps text-primary">{L('已上传', 'Uploaded')}</span>
            <div className="flex items-center gap-3 mt-1">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation() }}
                className="flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-2.5 py-1 font-label-caps text-[10px] text-primary transition-colors hover:bg-primary/15"
              >
                <span className="material-symbols-outlined text-[12px]">visibility</span>
                {L('预览', 'Preview')}
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onRetake?.() }}
                className="flex items-center gap-1 rounded-full border border-outline-variant/40 bg-surface-container-high px-2.5 py-1 font-label-caps text-[10px] text-on-surface-variant transition-colors hover:border-outline-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[12px]">refresh</span>
                {L('重拍', 'Retake')}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={onUpload}
            className="flex h-full w-full flex-col items-center justify-center gap-2"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high transition-colors group-hover:bg-primary/20">
              <span className="material-symbols-outlined text-on-surface-variant transition-colors group-hover:text-primary">
                add_photo_alternate
              </span>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant transition-colors group-hover:text-primary">
              {label}
            </span>
          </button>
        )}
      </div>
    </div>
  )
}
