import { useCallback, useEffect, useState } from 'react'
import { Megaphone, Play, CheckCircle2, SkipForward, RefreshCw, Layers, Monitor } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import StatusBadge from '../../components/tickets/StatusBadge'
import { formatTicketNumber } from '../../utils/ticket'
import { agentTicketsApi } from '../../api/agentTickets'
import { getErrorMessage } from '../../utils/errors'
import { useRealtime } from '../../hooks/useRealtime'

const formatTime = (value) =>
  value ? new Date(value).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '—'

export default function Workspace() {
  const [assignment, setAssignment] = useState(null)
  const [queue, setQueue] = useState([])
  const [current, setCurrent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [notAssigned, setNotAssigned] = useState(false)
  const [error, setError] = useState('')

  // Recharge tout depuis le serveur : affectation, ticket en cours, file
  const refresh = useCallback(async () => {
    try {
      const a = await agentTicketsApi.assignment()
      setAssignment(a)
      setNotAssigned(false)
      const [cur, q] = await Promise.all([agentTicketsApi.current(), agentTicketsApi.queue()])
      setCurrent(cur)
      setQueue(q)
    } catch (err) {
      if (err.response?.status === 400) {
        setNotAssigned(true)
        setAssignment(null)
        setCurrent(null)
        setQueue([])
      } else {
        setError(getErrorMessage(err, 'Impossible de charger votre espace de travail.'))
      }
    }
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
    const timer = setInterval(refresh, 30000)
    return () => clearInterval(timer)
  }, [refresh])
  // Nouveau ticket, ou ticket appelé par un collègue du même service
useRealtime([assignment && `/topic/services/${assignment.serviceId}/queue`], refresh)

  const run = async (action, fallbacks = {}) => {
    setBusy(true)
    setError('')
    try {
      await action()
    } catch (err) {
      setError(getErrorMessage(err, fallbacks[err.response?.status] ?? 'Action impossible.'))
    } finally {
      await refresh()
      setBusy(false)
    }
  }

  const handleCallNext = () =>
    run(() => agentTicketsApi.callNext(), {
      404: 'Aucun ticket en attente.',
      409: "Terminez ou passez votre ticket en cours avant d'en appeler un autre.",
      400: 'Appel impossible : votre guichet est inactif ou vous n\'êtes affecté à aucun guichet.',
    })

  const handleStart = () =>
    run(() => agentTicketsApi.start(current.id), { 409: "Ce ticket n'est plus en attente de démarrage." })

  const handleComplete = () =>
    run(() => agentTicketsApi.complete(current.id), {
      409: 'Ce ticket ne peut pas être terminé dans son état actuel.',
    })

  const handleSkip = () =>
    run(() => agentTicketsApi.skip(current.id), { 409: 'Ce ticket ne peut plus être passé.' })

  if (!loading && notAssigned) {
    return (
      <>
        <PageHeader title="Mon guichet" subtitle="Appelez et traitez les tickets de votre file." />
        <Card>
          <p className="py-10 text-center text-slate-500">
            Vous n'êtes affecté à aucun guichet. Demandez à votre administrateur de vous en attribuer un.
          </p>
        </Card>
      </>
    )
  }

  const counterInactive = assignment && !assignment.counterActive

  return (
    <>
      <PageHeader
        title="Mon guichet"
        subtitle="Appelez et traitez les tickets de votre file."
        action={<Button variant="secondary" icon={RefreshCw} onClick={refresh}>Actualiser</Button>}
      />

      {assignment && (
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 shadow-sm ring-1 ring-slate-200">
            <Layers className="h-4 w-4 text-brand-600" />
            <span className="text-sm text-slate-500">Service</span>
            <span className="text-sm font-semibold text-slate-900">{assignment.serviceName}</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 shadow-sm ring-1 ring-slate-200">
            <Monitor className="h-4 w-4 text-brand-600" />
            <span className="text-sm text-slate-500">Guichet</span>
            <span className="text-sm font-semibold text-slate-900">{assignment.counterName}</span>
            {counterInactive && <Badge tone="slate">Inactif</Badge>}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">{error}</div>
      )}
      {counterInactive && (
        <div className="mb-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700 ring-1 ring-amber-100">
          Votre guichet est inactif : vous ne pouvez pas appeler de ticket.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Ticket en cours" className="lg:col-span-2">
          <div className="flex flex-col items-center py-6">
            {loading ? (
              <p className="py-10 text-slate-400">Chargement...</p>
            ) : current ? (
              <>
                <StatusBadge status={current.status} />
                <p className="mt-3 text-6xl font-bold tracking-tight text-brand-600">
                  {formatTicketNumber(current.number)}
                </p>
                <p className="mt-2 text-sm text-slate-500">Appelé à {formatTime(current.calledAt)}</p>
              </>
            ) : (
              <p className="py-10 text-slate-400">Aucun ticket en cours. Appelez le suivant.</p>
            )}

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button
                size="lg"
                icon={Megaphone}
                disabled={busy || loading || current !== null || counterInactive}
                onClick={handleCallNext}
              >
                Appeler le suivant
              </Button>
              <Button size="lg" variant="secondary" icon={Play} disabled={busy || current?.status !== 'CALLED'} onClick={handleStart}>
                Démarrer
              </Button>
              <Button size="lg" variant="success" icon={CheckCircle2} disabled={busy || current?.status !== 'IN_PROGRESS'} onClick={handleComplete}>
                Terminer
              </Button>
              <Button size="lg" variant="ghost" icon={SkipForward} disabled={busy || current?.status !== 'CALLED'} onClick={handleSkip}>
                Passer
              </Button>
            </div>
          </div>
        </Card>

        <Card title={`File d'attente (${queue.length})`}>
          {queue.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">Aucun ticket en attente.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {queue.map((t) => (
                <li key={t.id} className="flex items-center justify-between py-3 text-sm">
                  <span className="font-semibold text-slate-900">{formatTicketNumber(t.number)}</span>
                  <span className="text-slate-500">{formatTime(t.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  )
}