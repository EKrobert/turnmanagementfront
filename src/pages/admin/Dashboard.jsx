import { useEffect, useState } from 'react'
import { Ticket, CheckCircle2, Clock, Play, SkipForward, Timer, Megaphone, Hourglass } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import StatCard from '../../components/ui/StatCard'
import Card from '../../components/ui/Card'
import { statsApi } from '../../api/stats'
import { formatDuration } from '../../utils/format'
import { getErrorMessage } from '../../utils/errors'

const PERIODS = [
  { value: 'TODAY', label: "Aujourd'hui" },
  { value: 'WEEK', label: '7 jours' },
  { value: 'MONTH', label: '30 jours' },
]

function BarList({ items, empty }) {
  const max = Math.max(...items.map((i) => i.tickets), 1)
  if (items.length === 0) return <p className="py-4 text-center text-sm text-slate-400">{empty}</p>
  return (
    <ul className="space-y-4">
      {items.map((i) => (
        <li key={i.id}>
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-slate-700">{i.name ?? '#${i.id}'}</span>
            <span className="text-slate-500">{i.tickets} ticket(s)</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100">
            <div className="h-2 rounded-full bg-brand-600" style={{ width: `${(i.tickets / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  )
}

export default function Dashboard() {
  const [period, setPeriod] = useState('TODAY')
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    statsApi
      .get(period)
      .then((data) => {
        if (!cancelled) setStats(data)
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, 'Impossible de charger les statistiques.'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [period])

  const switcher = (
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

  const t = stats?.totals
  const maxHour = stats ? Math.max(...stats.byHour.map((h) => h.tickets), 1) : 1

  return (
    <>
      <PageHeader title="Tableau de bord" subtitle="Vue d'ensemble de votre établissement." action={switcher} />

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">{error}</div>
      )}

      {loading && !stats ? (
        <Card><p className="py-10 text-center text-slate-400">Chargement...</p></Card>
      ) : stats ? (
        <div className={loading ? 'opacity-60 transition' : 'transition'}>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Tickets créés" value={t.created} icon={Ticket} tone="indigo" />
            <StatCard label="En attente" value={t.waiting} icon={Clock} tone="amber" />
            <StatCard label="Appelés" value={t.called} icon={Megaphone} tone="sky" />
            <StatCard label="En cours" value={t.inProgress} icon={Play} tone="indigo" />
            <StatCard label="Terminés" value={t.completed} icon={CheckCircle2} tone="green" />
            <StatCard label="Passés" value={t.skipped} icon={SkipForward} tone="slate" />
            <StatCard label="Attente moyenne" value={formatDuration(stats.avgWaitSeconds)} icon={Timer} tone="amber" />
            <StatCard label="Durée de traitement" value={formatDuration(stats.avgHandlingSeconds)} icon={Hourglass} tone="green" />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <Card title="Activité par heure" className="lg:col-span-2">
              <div className="flex h-44 items-end gap-1">
                {stats.byHour.map((h) => (
                  <div
                    key={h.hour}
                    title={`${h.hour}h : ${h.tickets} ticket(s)`}
                    className="flex-1 rounded-t bg-brand-500/80"
                    style={{ height: `${Math.max((h.tickets / maxHour) * 100, h.tickets > 0 ? 4 : 1)}%` }}
                  />
                ))}
              </div>
              <div className="mt-2 flex gap-1">
                {stats.byHour.map((h) => (
                  <span key={h.hour} className="flex-1 text-center text-[10px] text-slate-400">
                    {h.hour % 3 === 0 ? `${h.hour}h` : ''}
                  </span>
                ))}
              </div>
            </Card>

            <Card title="Répartition par service">
              <BarList
                items={stats.byService.map((s) => ({ id: s.serviceId, name: s.name, tickets: s.tickets }))}
                empty="Aucun service."
              />
            </Card>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card title="Activité par guichet">
              <BarList
                items={stats.byCounter.map((c) => ({ id: c.counterId, name: c.name, tickets: c.tickets }))}
                empty="Aucun ticket traité sur cette période."
              />
            </Card>
            <Card title="Activité par agent">
              <BarList
                items={stats.byAgent.map((a) => ({ id: a.agentId, name: a.name, tickets: a.tickets }))}
                empty="Aucun ticket traité sur cette période."
              />
            </Card>
          </div>
        </div>
      ) : null}
    </>
  )
}