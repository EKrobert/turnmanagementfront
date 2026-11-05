import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChevronRight, Ticket } from 'lucide-react'
import ClientLayout from '../../components/layout/ClientLayout'
import StatusBadge from '../../components/tickets/StatusBadge'
import { publicApi } from '../../api/public'
import { addTicketId, getTicketIds, saveTicketIds } from '../../utils/clientTickets'
import { formatTicketNumber } from '../../utils/ticket'
import { getErrorMessage } from '../../utils/errors'

const ACTIVE = ['WAITING', 'CALLED', 'IN_PROGRESS']

export default function Join() {
  const { qrToken } = useParams()
  const navigate = useNavigate()

  const [services, setServices] = useState([])
  const [myTickets, setMyTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [takingId, setTakingId] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const init = async () => {
      try {
        setServices(await publicApi.services(qrToken))
      } catch (err) {
        setError(
          err.response?.status === 404
            ? "Ce QR code n'est pas valide."
            : getErrorMessage(err, 'Impossible de charger les services.')
        )
      }

      // Retrouve les tickets du client et ne garde que ceux qui sont encore actifs
      const ids = getTicketIds(qrToken)
      const results = await Promise.allSettled(ids.map((id) => publicApi.getTicket(id)))
      const active = []
      const keepIds = []
      results.forEach((r, i) => {
        if (r.status === 'fulfilled') {
          if (ACTIVE.includes(r.value.status)) {
            active.push(r.value)
            keepIds.push(ids[i])
          }
        } else if (r.reason?.response?.status !== 404) {
          keepIds.push(ids[i]) // erreur réseau : on le garde pour plus tard
        }
      })
      saveTicketIds(qrToken, keepIds)
      setMyTickets(active)
      setLoading(false)
    }
    init()
  }, [qrToken])

  const ticketByService = Object.fromEntries(myTickets.map((t) => [t.serviceId, t]))

  const handleTake = async (service) => {
    if (ticketByService[service.id]) return
    setTakingId(service.id)
    setError('')
    try {
      const ticket = await publicApi.takeTicket(qrToken, service.id)
      addTicketId(qrToken, ticket.id)
      navigate(`/ticket/${ticket.id}`)
    } catch (err) {
      setError(getErrorMessage(err, 'Impossible de prendre un ticket pour ce service.'))
      setTakingId(null)
    }
  }

  return (
    <ClientLayout>
      {myTickets.length > 0 && (
        <section className="mt-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Vos tickets en cours</h2>
          <div className="mt-3 space-y-3">
            {myTickets.map((t) => (
              <Link
                key={t.id}
                to={`/ticket/${t.id}`}
                className="flex items-center justify-between rounded-xl bg-brand-50 p-4 ring-1 ring-brand-100"
              >
                <div>
                  <p className="text-sm text-brand-700">{t.serviceName}</p>
                  <p className="text-2xl font-bold text-brand-900">{formatTicketNumber(t.number)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={t.status} />
                  <ChevronRight className="h-5 w-5 text-brand-600" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <h1 className="mt-6 text-2xl font-bold text-slate-900">Prenez un ticket</h1>
      <p className="mt-1 text-sm text-slate-500">Choisissez le service dont vous avez besoin.</p>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">{error}</div>
      )}

      <div className="mt-6 space-y-3">
        {loading ? (
          <p className="py-10 text-center text-slate-400">Chargement...</p>
        ) : services.length === 0 && !error ? (
          <p className="py-10 text-center text-slate-400">Aucun service disponible pour le moment.</p>
        ) : (
          services.map((s) => {
            const mine = ticketByService[s.id]
            return (
              <button
                key={s.id}
                onClick={() => handleTake(s)}
                disabled={takingId !== null || Boolean(mine)}
                className="flex w-full items-center gap-4 rounded-xl bg-white p-4 text-left shadow-sm ring-1 ring-slate-200 transition hover:ring-brand-500 disabled:opacity-60 disabled:hover:ring-slate-200"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Ticket className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{s.name}</p>
                  {s.description && <p className="truncate text-sm text-slate-500">{s.description}</p>}
                </div>
                {mine ? (
                  <span className="text-xs font-medium text-brand-700">Ticket en cours</span>
                ) : takingId === s.id ? (
                  <span className="text-sm text-slate-400">...</span>
                ) : (
                  <ChevronRight className="h-5 w-5 text-slate-300" />
                )}
              </button>
            )
          })
        )}
      </div>
    </ClientLayout>
  )
}