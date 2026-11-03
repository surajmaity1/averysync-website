import { Ban } from 'lucide-react'
import { useEffect } from 'react'

type BlockConfirmDialogProps = {
  name: string
  isBlocking: boolean
  onCancel: () => void
  onConfirm: () => void
}

/**
 * Confirmation for the destructive block action. Blocking severs the follow
 * relationship both ways and hides the profiles from each other.
 */
export const BlockConfirmDialog = ({
  name,
  isBlocking,
  onCancel,
  onConfirm,
}: BlockConfirmDialogProps) => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onCancel])

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Dismiss dialog"
        onClick={onCancel}
        className="absolute inset-0 cursor-default bg-slate-900/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Block ${name}`}
        className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-xl"
      >
        <div className="flex flex-col items-center gap-3 px-6 pt-6 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
            <Ban className="h-6 w-6 text-red-600" />
          </span>
          <h2 className="text-lg font-bold tracking-tight text-slate-900">
            Block {name}?
          </h2>
          <p className="text-sm text-slate-500">
            They won't be able to find your profile, and you'll stop following
            each other. You can unblock them later from your blocked accounts.
          </p>
        </div>
        <div className="flex gap-3 p-6">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 flex-1 cursor-pointer rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isBlocking}
            className="h-10 flex-1 cursor-pointer rounded-full bg-red-600 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Block
          </button>
        </div>
      </div>
    </div>
  )
}
