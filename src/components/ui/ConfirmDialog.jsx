import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'
import Button from './Button'

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmer',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}) {
  const iconStyle = variant === 'danger' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'

  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <div className="flex gap-4">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconStyle}`}>
          <AlertTriangle className="h-5 w-5" />
        </div>
        <p className="text-sm leading-relaxed text-slate-600">{message}</p>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>Annuler</Button>
        <Button variant={variant} onClick={onConfirm} disabled={loading}>
          {loading ? 'Patientez...' : confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}