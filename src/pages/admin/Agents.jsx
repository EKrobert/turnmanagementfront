import { useCallback, useEffect, useState } from 'react'
import { Plus, Power, PowerOff } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import DataTable from '../../components/ui/DataTable'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Badge from '../../components/ui/Badge'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { agentsApi } from '../../api/agents'
import { getErrorMessage } from '../../utils/errors'

const EMPTY_FORM = { name: '', email: '', password: '' }

export default function Agents() {
  const [agents, setAgents] = useState([])
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
      setAgents(await agentsApi.list())
    } catch (err) {
      setError(getErrorMessage(err, 'Impossible de charger les agents.'))
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
      const created = await agentsApi.create({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: 'AGENT',
      })
      setAgents((list) => [...list, created])
      setOpen(false)
    } catch (err) {
      const fallback =
        err.response?.status === 409
          ? 'Cet email est déjà utilisé.'
          : 'Impossible de créer l\'agent. Vérifiez les champs.'
      setFormError(getErrorMessage(err, fallback))
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmToggle = async () => {
    const agent = confirmTarget
    setToggling(true)
    setError('')
    try {
      const updated = await agentsApi.update(agent.id, {
        name: agent.name,
        active: !agent.active,
      })
      setAgents((list) => list.map((a) => (a.id === updated.id ? updated : a)))
    } catch (err) {
      const fallback =
        err.response?.status === 409
          ? 'Cet agent a un ticket en cours : terminez-le ou passez-le d\'abord.'
          : 'Impossible de modifier l\'agent.'
      setError(getErrorMessage(err, fallback))
    } finally {
      setToggling(false)
      setConfirmTarget(null)
    }
  }

  const columns = [
    {
      header: 'Agent',
      render: (a) => (
        <div>
          <p className="font-medium text-slate-900">{a.name}</p>
          <p className="text-xs text-slate-500">{a.email}</p>
        </div>
      ),
    },
    {
      header: 'Statut',
      render: (a) => <Badge tone={a.active ? 'green' : 'slate'}>{a.active ? 'Actif' : 'Inactif'}</Badge>,
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (a) => (
        <div className="flex justify-end gap-2">
          <Button
            variant={a.active ? 'soft-danger' : 'soft-success'}
            size="sm"
            icon={a.active ? PowerOff : Power}
            onClick={() => setConfirmTarget(a)}
          >
            {a.active ? 'Désactiver' : 'Activer'}
          </Button>
        </div>
      ),
    },
  ]

  const deactivating = confirmTarget?.active

  return (
    <>
      <PageHeader
        title="Agents"
        subtitle="Gérez les comptes des personnes qui traitent les tickets."
        action={<Button icon={Plus} onClick={openModal}>Nouvel agent</Button>}
      />

      {error && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">
          <span>{error}</span>
          <button onClick={load} className="font-medium underline">Recharger</button>
        </div>
      )}

      <DataTable
        columns={columns}
        rows={agents}
        loading={loading}
        empty="Aucun agent pour l'instant. Créez le premier."
      />

      <Modal open={open} title="Nouvel agent" onClose={() => setOpen(false)}>
        <form className="space-y-4" onSubmit={handleCreate}>
          {formError && (
            <div className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700 ring-1 ring-red-100">{formError}</div>
          )}
          <Input
            label="Nom"
            placeholder="Nom complet"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            placeholder="agent@exemple.com"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            label="Mot de passe initial"
            type="password"
            placeholder="8 caractères minimum"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Annuler</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Création...' : 'Créer'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmTarget !== null}
        title={deactivating ? 'Désactiver cet agent ?' : 'Activer cet agent ?'}
        message={
          deactivating
            ? `« ${confirmTarget?.name} » ne pourra plus se connecter et sera retiré de son guichet.`
            : `« ${confirmTarget?.name} » pourra de nouveau se connecter.`
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