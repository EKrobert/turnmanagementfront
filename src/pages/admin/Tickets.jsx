import { useEffect, useMemo, useState } from 'react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import DataTable from '../../components/ui/DataTable'
import StatusBadge from '../../components/tickets/StatusBadge'
import { STATUS, formatTicketNumber } from '../../utils/ticket'
import { servicesApi } from '../../api/services'
import { agentsApi } from '../../api/agents'
import { ticketsApi } from '../../api/tickets'
import { getErrorMessage } from '../../utils/errors'

const PERIODS = [
  { value: 'TODAY', label: "Aujourd'hui", days: 1 },
  { value: 'WEEK', label: '7 jours', days: 7 },
  { value: 'MONTH', label: '30 jours', days: 30 },
  { value: 'ALL', label: 'Tout', days: null },
]

// Début de la période : minuit (heure locale) du jour (aujourd'hui - days + 1)
const periodStart = (days) => {
  if (!days) return null
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - (days - 1))
  return d
}

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
    : '—'

export default function Tickets() {
  const [services, setServices] = useState([])
  const [serviceId, setServiceId] = useState('')
  const [status, setStatus] = useState('')
  const [period, setPeriod] = useState('TODAY')
  const [agents, setAgents] = useState([])
  const [tickets, setTickets] = useState([])
  const [loadingServices, setLoadingServices] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Services + agents (une seule fois)
  useEffect(() => {
    Promise.all([servicesApi.list(), agentsApi.list()])
      .then(([serviceList, agentList]) => {
        setServices(serviceList)
        setAgents(agentList)
        if (serviceList.length > 0) setServiceId(String(serviceList[0].id))
      })
      .catch((err) => setError(getErrorMessage(err, 'Impossible de charger les données.')))
      .finally(() => setLoadingServices(false))
  }, [])

  // Tickets du service, filtrés par statut (côté API)
  useEffect(() => {
    if (!serviceId) return
    let cancelled = false
    setLoading(true)
    setError('')
    ticketsApi
      .listByService(serviceId, status)
      .then((list) => {
        if (!cancelled) setTickets(list)
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, 'Impossible de charger les tickets.'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [serviceId, status])

  const agentsById = useMemo(() => Object.fromEntries(agents.map((a) => [a.id, a])), [agents])

  // Filtre par période (côté navigateur) puis tri du plus récent au plus ancien
  const visible = useMemo(() => {
    const days = PERIODS.find((p) => p.value === period)?.days
    const start = periodStart(days)
    return tickets
      .filter((t) => !start || new Date(t.createdAt) >= start)
      .sort((a, b) => b.id - a.id)
  }, [tickets, period])

  const columns = [
    { header: 'Ticket', render: (t) => <span className="font-semibold text-slate-900">{formatTicketNumber(t.number)}</span> },
    { header: 'Statut', render: (t) => <StatusBadge status={t.status} /> },
    { header: 'Guichet', render: (t) => t.counterName ?? '—' },
    { header: 'Agent', render: (t) => (t.agentId ? agentsById[t.agentId]?.name ?? `#${t.agentId}` : '—') },
    { header: 'Créé', render: (t) => formatDate(t.createdAt) },
    { header: 'Appelé', render: (t) => formatDate(t.calledAt) },
    { header: 'Terminé', render: (t) => formatDate(t.finishedAt) },
  ]

  const periodSwitcher = (
    <div className="inline-flex rounded-lg bg-white p-1 shadow-sm ring-1 ring-slate-200">
      {PERIODS.map((p) => (
        <button
          key={p.value}
          onClick={() => setPeriod(p.value)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
            period === p.value ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  )

  return (
    <>
      <PageHeader
        title="Historique des tickets"
        subtitle="Consultez les tickets de chaque service."
        action={periodSwitcher}
      />

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">{error}</div>
      )}

      {loadingServices ? (
        <Card><p className="py-6 text-center text-slate-400">Chargement...</p></Card>
      ) : services.length === 0 ? (
        <Card><p className="py-6 text-center text-slate-400">Aucun service pour l'instant.</p></Card>
      ) : (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Input as="select" aria-label="Service" value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.name}{s.active ? '' : ' (inactif)'}</option>
              ))}
            </Input>
            <Input as="select" aria-label="Statut" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Tous les statuts</option>
              {Object.entries(STATUS).map(([key, s]) => (
                <option key={key} value={key}>{s.label}</option>
              ))}
            </Input>
          </div>

          <DataTable
            columns={columns}
            rows={visible}
            loading={loading}
            empty="Aucun ticket pour ce service sur cette période."
          />
        </>
      )}
    </>
  )
}