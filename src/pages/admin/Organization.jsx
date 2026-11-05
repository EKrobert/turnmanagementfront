import { useCallback, useEffect, useState } from 'react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import QrCodeCard from '../../components/organization/QrCodeCard'
import { organizationApi } from '../../api/organization'
import { getErrorMessage } from '../../utils/errors'
import { ExternalLink } from 'lucide-react'

export default function Organization() {
  const [organization, setOrganization] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setOrganization(await organizationApi.get())
    } catch (err) {
      setError(getErrorMessage(err, "Impossible de charger les informations de l'établissement."))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <>
      <PageHeader title="Établissement" subtitle="Informations et QR code d'accès pour vos clients." />

      {error && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">
          <span>{error}</span>
          <button onClick={load} className="font-medium underline">Réessayer</button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Informations">
          {loading ? (
            <p className="py-6 text-center text-slate-400">Chargement...</p>
          ) : organization ? (
            <div className="space-y-4">
              <Input label="Nom" value={organization.name ?? ''} readOnly />
              <Input label="Adresse" value={organization.address ?? ''} readOnly />
              <div>
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Statut</span>
                <Badge tone={organization.active ? 'green' : 'slate'}>
                  {organization.active ? 'Actif' : 'Inactif'}
                </Badge>
              </div>
            </div>
          ) : null}
        </Card>

        <QrCodeCard />

        {organization && (
          <Card title="Écran d'affichage">
            <p className="text-sm text-slate-500">
              Ouvrez cette page sur la télévision de votre salle d'attente. Elle affiche les tickets appelés en temps réel.
            </p>
            <a
              href={`/display/${organization.qrToken}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
            >
              <ExternalLink className="h-4 w-4" />
              Ouvrir l'écran
            </a>
          </Card>
        )}
      </div>
    </>
  )
}