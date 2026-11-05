import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Power, PowerOff, UserPlus, X } from 'lucide-react'
import DataTable from '../ui/DataTable'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Modal from '../ui/Modal'
import Badge from '../ui/Badge'
import ConfirmDialog from '../ui/ConfirmDialog'
import { countersApi } from '../../api/counters'
import { agentsApi } from '../../api/agents'
import { getErrorMessage } from '../../utils/errors'

export default function CountersPanel({ serviceId, toolbar }) {
  const [counters, setCounters] = useState([])
  const [assignments, setAssignments] = useState({}) // { counterId: [agentId] }
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const [assignTarget, setAssignTarget] = useState(null) // guichet
  const [selectedAgent, setSelectedAgent] = useState('')
  const [assignError, setAssignError] = useState('')
  const [assigning, setAssigning] = useState(false)

  const [unassignTarget, setUnassignTarget] = useState(null) // { counter, agentId }
  const [toggleTarget, setToggleTarget] = useState(null) // guichet
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [counterList, agentList] = await Promise.all([
        countersApi.listByService(serviceId),
        agentsApi.list(),
      ])
      const lists = await Promise.all(counterList.map((c) => countersApi.listAgents(c.id)))
      const map = {}
      counterList.forEach((c, i) => {
        map[c.id] = lists[i].map((a) => a.agentId)
      })
      setCounters(counterList)
      setAssignments(map)
      setAgents(agentList)
    } catch (err) {
      setError(getErrorMessage(err, 'Impossible de charger les guichets.'))
    } finally {
      setLoading(false)
    }
  }, [serviceId])

  useEffect(() => {
    load()
  }, [load])

  const agentsById = useMemo(() => Object.fromEntries(agents.map((a) => [a.id, a])), [agents])

  const availableAgents = useMemo(() => {
    const taken = new Set(Object.values(assignments).flat())
    return agents.filter((a) => a.active && !taken.has(a.id))
  }, [agents, assignments])

  const openCreate = () => {
    setNewName('')
    setFormError('')
    setCreateOpen(true)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      const created = await countersApi.create(serviceId, { name: newName.trim(), active: true })
      setCounters((list) => [...list, created])
      setAssignments((m) => ({ ...m, [created.id]: [] }))
      setCreateOpen(false)
    } catch (err) {
      setFormError(getErrorMessage(err, 'Impossible de créer le guichet. Vérifiez le nom.'))
    } finally {
      setSaving(false)
    }
  }

  const openAssign = (counter) => {
    setSelectedAgent('')
    setAssignError('')
    setAssignTarget(counter)
  }

  const handleAssign = async (e) => {
    e.preventDefault()
    setAssigning(true)
    setAssignError('')
    try {
      const created = await countersApi.assignAgent(assignTarget.id, Number(selectedAgent))
      setAssignments((m) => ({ ...m, [assignTarget.id]: [...(m[assignTarget.id] ?? []), created.agentId] }))
      setAssignTarget(null)
    } catch (err) {
      const fallback =
        err.response?.status === 409
          ? 'Cet agent est déjà affecté à un guichet.'
          : "Impossible d'affecter cet agent."
      setAssignError(getErrorMessage(err, fallback))
    } finally {
      setAssigning(false)
    }
  }

  const handleUnassign = async () => {
    const { counter, agentId } = unassignTarget
    setBusy(true)
    setError('')
    try {
      await countersApi.unassignAgent(counter.id, agentId)
      setAssignments((m) => ({ ...m, [counter.id]: (m[counter.id] ?? []).filter((id) => id !== agentId) }))
    } catch (err) {
      const fallback =
        err.response?.status === 409
          ? "Cet agent a un ticket en cours : il doit d'abord le terminer ou le passer."
          : "Impossible de retirer l'agent."
      setError(getErrorMessage(err, fallback))
    } finally {
      setBusy(false)
      setUnassignTarget(null)
    }
  }

  const handleToggle = async () => {
    const counter = toggleTarget
    setBusy(true)
    setError('')
    try {
      const updated = await countersApi.update(counter.id, { name: counter.name, active: !counter.active })
      setCounters((list) => list.map((c) => (c.id === updated.id ? updated : c)))
    } catch (err) {
      setError(getErrorMessage(err, 'Impossible de modifier le guichet.'))
    } finally {
      setBusy(false)
      setToggleTarget(null)
    }
  }

  const columns = [
    {
      header: 'Guichet',
      render: (c) => <span className="font-medium text-slate-900">{c.name}</span>,
    },
    {
      header: 'Agent affecté',
      render: (c) => {
        const ids = assignments[c.id] ?? []
        if (ids.length === 0) return <span className="text-slate-400">Aucun agent</span>
        return (
          <div className="flex flex-wrap gap-2">
            {ids.map((id) => (
              <span key={id} className="inline-flex items-center gap-1 rounded-full bg-brand-50 py-0.5 pl-2.5 pr-1 text-xs font-medium text-brand-700">
                {agentsById[id]?.name ?? `Agent #${id}`}
                <button
                  onClick={() => setUnassignTarget({ counter: c, agentId: id })}
                  className="rounded-full p-0.5 hover:bg-brand-100"
                  aria-label="Retirer l'agent"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )
      },
    },
    {
      header: 'Statut',
      render: (c) => <Badge tone={c.active ? 'green' : 'slate'}>{c.active ? 'Actif' : 'Inactif'}</Badge>,
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (c) => (
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" icon={UserPlus} disabled={!c.active} onClick={() => openAssign(c)}>
            Affecter
          </Button>
          <Button
            variant={c.active ? 'soft-danger' : 'soft-success'}
            size="sm"
            icon={c.active ? PowerOff : Power}
            onClick={() => setToggleTarget(c)}
          >
            {c.active ? 'Désactiver' : 'Activer'}
          </Button>
        </div>
      ),
    },
  ]

  const deactivating = toggleTarget?.active

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="w-full sm:w-72">{toolbar}</div>
        <Button icon={Plus} onClick={openCreate}>Nouveau guichet</Button>
      </div>

      {error && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">
          <span>{error}</span>
          <button onClick={load} className="font-medium underline">Recharger</button>
        </div>
      )}

      <DataTable
        columns={columns}
        rows={counters}
        loading={loading}
        empty="Aucun guichet dans ce service. Créez le premier."
      />

      <Modal open={createOpen} title="Nouveau guichet" onClose={() => setCreateOpen(false)}>
        <form className="space-y-4" onSubmit={handleCreate}>
          {formError && (
            <div className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700 ring-1 ring-red-100">{formError}</div>
          )}
          <Input label="Nom du guichet" placeholder="Ex : Guichet 1" required value={newName} onChange={(e) => setNewName(e.target.value)} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>Annuler</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Création...' : 'Créer'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={assignTarget !== null} title={`Affecter un agent à ${assignTarget?.name ?? ''}`} onClose={() => setAssignTarget(null)}>
        <form className="space-y-4" onSubmit={handleAssign}>
          {assignError && (
            <div className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700 ring-1 ring-red-100">{assignError}</div>
          )}
          {availableAgents.length === 0 ? (
            <p className="text-sm text-slate-500">Aucun agent disponible : ils sont tous inactifs ou déjà affectés.</p>
          ) : (
            <Input label="Agent" as="select" required value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)}>
              <option value="">Choisir un agent</option>
              {availableAgents.map((a) => (
                <option key={a.id} value={a.id}>{a.name} ({a.email})</option>
              ))}
            </Input>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setAssignTarget(null)}>Annuler</Button>
            <Button type="submit" disabled={assigning || availableAgents.length === 0}>
              {assigning ? 'Affectation...' : 'Affecter'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={unassignTarget !== null}
        title="Retirer cet agent ?"
        message={`« ${agentsById[unassignTarget?.agentId]?.name ?? 'Cet agent'} » ne sera plus affecté à « ${unassignTarget?.counter.name} ».`}
        confirmLabel="Retirer"
        variant="danger"
        loading={busy}
        onConfirm={handleUnassign}
        onCancel={() => setUnassignTarget(null)}
      />

      <ConfirmDialog
        open={toggleTarget !== null}
        title={deactivating ? 'Désactiver ce guichet ?' : 'Activer ce guichet ?'}
        message={
          deactivating
            ? `On ne pourra plus affecter d'agent à « ${toggleTarget?.name} » tant qu'il restera désactivé.`
            : `« ${toggleTarget?.name} » pourra de nouveau recevoir des agents.`
        }
        confirmLabel={deactivating ? 'Désactiver' : 'Activer'}
        variant={deactivating ? 'danger' : 'success'}
        loading={busy}
        onConfirm={handleToggle}
        onCancel={() => setToggleTarget(null)}
      />
    </>
  )
}