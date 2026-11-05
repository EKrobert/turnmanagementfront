import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Eye, Power, PowerOff } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import DataTable from '../../components/ui/DataTable'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Badge from '../../components/ui/Badge'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { servicesApi } from '../../api/services'
import { getErrorMessage } from '../../utils/errors'

const EMPTY_FORM = { name: '', description: '' }

export default function Services() {
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const [confirmTarget, setConfirmTarget] = useState(null)
  const [toggling, setToggling] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setServices(await servicesApi.list())
    } catch (err) {
      setError(getErrorMessage(err, 'Impossible de charger les services.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const openModal = () => {
    setForm(EMPTY_FORM)
    setFormError('')
    setOpen(true)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      const created = await servicesApi.create({
        name: form.name.trim(),
        description: form.description.trim(),
        active: true,
      })
      setServices((list) => [...list, created])
      setOpen(false)
    } catch (err) {
      setFormError(getErrorMessage(err, 'Impossible de créer le service. Vérifiez les champs.'))
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmToggle = async () => {
    const service = confirmTarget
    setToggling(true)
    setError('')
    try {
      const updated = await servicesApi.update(service.id, {
        name: service.name,
        description: service.description,
        active: !service.active,
      })
      setServices((list) => list.map((s) => (s.id === updated.id ? updated : s)))
    } catch (err) {
      setError(getErrorMessage(err, 'Impossible de modifier le service.'))
    } finally {
      setToggling(false)
      setConfirmTarget(null)
    }
  }

  const columns = [
    {
      header: 'Service',
      render: (s) => <span className="font-medium text-slate-900">{s.name}</span>,
    },
    {
      header: 'Description',
      render: (s) => s.description || <span className="text-slate-400">Aucune description</span>,
    },
    {
      header: 'Statut',
      render: (s) => <Badge tone={s.active ? 'green' : 'slate'}>{s.active ? 'Actif' : 'Inactif'}</Badge>,
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (s) => (
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" icon={Eye} onClick={() => navigate(`/admin/services/${s.id}`)}>
            Voir
          </Button>
          <Button
            variant={s.active ? 'soft-danger' : 'soft-success'}
            size="sm"
            icon={s.active ? PowerOff : Power}
            onClick={() => setConfirmTarget(s)}
          >
            {s.active ? 'Désactiver' : 'Activer'}
          </Button>
        </div>
      ),
    },
  ]

  const deactivating = confirmTarget?.active

  return (
    <>
      <PageHeader
        title="Services"
        subtitle="Organisez votre établissement en plusieurs files d'attente."
        action={<Button icon={Plus} onClick={openModal}>Nouveau service</Button>}
      />

      {error && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">
          <span>{error}</span>
          <button onClick={load} className="font-medium underline">Réessayer</button>
        </div>
      )}

      <DataTable
        columns={columns}
        rows={services}
        loading={loading}
        empty="Aucun service pour l'instant. Créez le premier."
      />

      <Modal open={open} title="Nouveau service" onClose={() => setOpen(false)}>
        <form className="space-y-4" onSubmit={handleCreate}>
          {formError && (
            <div className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700 ring-1 ring-red-100">{formError}</div>
          )}
          <Input
            label="Nom"
            placeholder="Ex : Accueil"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Description"
            as="textarea"
            rows={3}
            placeholder="Description du service"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Annuler</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Création...' : 'Créer'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmTarget !== null}
        title={deactivating ? 'Désactiver ce service ?' : 'Activer ce service ?'}
        message={
          deactivating
            ? `Les clients ne pourront plus prendre de ticket pour « ${confirmTarget?.name} » tant qu'il restera désactivé.`
            : `Les clients pourront de nouveau prendre un ticket pour « ${confirmTarget?.name} ».`
        }
        confirmLabel={deactivating ? 'Désactiver' : 'Activer'}
        variant={deactivating ? 'danger' : 'success'}
        loading={toggling}
        onConfirm={handleConfirmToggle}
        onCancel={() => setConfirmTarget(null)}
      />
    </>
  )
}