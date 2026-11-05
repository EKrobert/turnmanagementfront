import { useCallback, useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import DataTable from '../../components/ui/DataTable'
import Button from '../../components/ui/Button'
import StatusBadge from '../../components/tickets/StatusBadge'
import { formatTicketNumber } from '../../utils/ticket'
import { formatDuration } from '../../utils/format'
import { agentTicketsApi } from '../../api/agentTickets'
import { getErrorMessage } from '../../utils/errors'

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
    : '—'

const secondsBetween = (from, to) =>
  from && to ? (new Date(to) - new Date(from)) / 1000 : null

export default function History() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setTickets(await agentTicketsApi.history())
    } catch (err) {
      setError(getErrorMessage(err, "Impossible de charger l'historique."))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const columns = [
    { header: 'Ticket', render: (t) => <span className="font-semibold text-slate-900">{formatTicketNumber(t.number)}</span> },
    { header: 'Service', render: (t) => t.serviceName },
    { header: 'Guichet', render: (t) => t.counterName ?? '—' },
    { header: 'Créé à', render: (t) => formatDate(t.createdAt) },
    { header: 'Appelé à', render: (t) => formatDate(t.calledAt) },
    { header: 'Terminé à', render: (t) => formatDate(t.finishedAt) },
    { header: 'Attente', render: (t) => formatDuration(secondsBetween(t.createdAt, t.calledAt)) },
    { header: 'Durée', render: (t) => formatDuration(secondsBetween(t.startedAt, t.finishedAt)) },
    { header: 'Statut', render: (t) => <StatusBadge status={t.status} /> },
  ]

  return (
    <>
      <PageHeader
        title="Tickets traités"
        subtitle="Vos 100 derniers tickets terminés ou passés."
        action={<Button variant="secondary" icon={RefreshCw} onClick={load}>Actualiser</Button>}
      />

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">{error}</div>
      )}

      <DataTable
        columns={columns}
        rows={tickets}
        loading={loading}
        empty="Aucun ticket traité pour l'instant."
      />
    </>
  )
}