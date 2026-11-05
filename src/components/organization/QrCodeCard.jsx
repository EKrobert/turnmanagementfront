import { useEffect, useState } from 'react'
import { Download, QrCode } from 'lucide-react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { organizationApi } from '../../api/organization'
import { getErrorMessage } from '../../utils/errors'

export default function QrCodeCard() {
  const [imageUrl, setImageUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let objectUrl = null
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const blob = await organizationApi.getQr()
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setImageUrl(objectUrl)
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err, 'Impossible de charger le QR code.'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [attempt])

  return (
    <Card title="QR code">
      <div className="flex flex-col items-center py-4">
        <div className="flex h-56 w-56 items-center justify-center rounded-2xl bg-slate-50 ring-1 ring-slate-200">
          {loading ? (
            <span className="text-sm text-slate-400">Chargement...</span>
          ) : imageUrl ? (
            <img src={imageUrl} alt="QR code de l'établissement" className="h-48 w-48" />
          ) : (
            <QrCode className="h-24 w-24 text-slate-300" />
          )}
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-3 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700 ring-1 ring-red-100">
            <span>{error}</span>
            <button onClick={() => setAttempt((n) => n + 1)} className="font-medium underline">
              Réessayer
            </button>
          </div>
        )}

        <p className="mt-4 text-center text-sm text-slate-500">
          Imprimez ce QR code et affichez-le dans votre établissement.
        </p>

        <a href={imageUrl ?? undefined} download="qr-code.png" className={imageUrl ? '' : 'pointer-events-none'}>
          <Button icon={Download} className="mt-4" disabled={!imageUrl}>
            Télécharger
          </Button>
        </a>
      </div>
    </Card>
  )
}