import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ClientLayout from '../../components/layout/ClientLayout'
import StatusBadge from '../../components/tickets/StatusBadge'
import { publicApi } from '../../api/public'
import { useRealtime } from '../../hooks/useRealtime'
import { getLastQr } from '../../utils/clientTickets'
import { formatTicketNumber } from '../../utils/ticket'

const MESSAGES = {
  WAITING: 'Vous êtes dans la file. Gardez cette page ouverte, elle se met à jour toute seule.',
  CALLED: "C'est votre tour ! Présentez-vous au guichet.",
  IN_PROGRESS: 'Votre demande est en cours de traitement.',
  COMPLETED: 'Votre demande est terminée. Merci !',
  SKIPPED: 'Votre ticket a été passé car vous ne vous êtes pas présenté. Reprenez un ticket si besoin.',
}

const FINAL = ['COMPLETED', 'SKIPPED']
const FALLBACK_MS = 30000

const formatTime = (value) =>
  value ? new Date(value).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : null

export default function TicketTracking() {
  const { id } = useParams()
  const [ticket, setTicket] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [offline, setOffline] = useState(false)
  const timer = useRef(null)

  const load = useCallback(async () => {
    clearTimeout(timer.current)
    try {
      const data = await publicApi.getTicket(id)
      setTicket(data)
      setOffline(false)
      if (!FINAL.includes(data.status)) timer.current = setTimeout(load, FALLBACK_MS)
    } catch (err) {
      if (err.response?.status === 404) setNotFound(true)
      else {
        setOffline(true)
        timer.current = setTimeout(load, 5000)
      }
    }
  }, [id])

  useEffect(() => {
    load()
    return () => clearTimeout(timer.current)
  }, [load])

  // Mise à jour instantanée ; le polling ci-dessus ne sert que de secours
  useRealtime([`/topic/tickets/${id}`], load)

  if (notFound) {
    return (
      <ClientLayout>
        <p className="py-16 text-center text-slate-500">Ticket introuvable.</p>
      </ClientLayout>
    )
  }

  const called = ticket?.status === 'CALLED'
  const lastQr = getLastQr()

  return (
    <ClientLayout>
      {!ticket ? (
        <p className="py-16 text-center text-slate-400">Chargement...</p>
      ) : (
        <div className="mt-4">
          {offline && (
            <div className="mb-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700 ring-1 ring-amber-100">
              Connexion perdue, nouvelle tentative...
            </div>
          )}

          <div
            className={`rounded-2xl p-8 text-center shadow-sm ring-1 ${
              called ? 'bg-brand-600 text-white ring-brand-600' : 'bg-white text-slate-900 ring-slate-200'
            }`}
          >
            <p className={`text-sm ${called ? 'text-brand-100' : 'text-slate-500'}`}>Votre ticket</p>
            <p className="mt-2 text-6xl font-bold tracking-tight">{formatTicketNumber(ticket.number)}</p>
            <p className={`mt-2 text-sm ${called ? 'text-brand-100' : 'text-slate-500'}`}>{ticket.serviceName}</p>
            <div className="mt-4 flex justify-center">
              <StatusBadge status={ticket.status} />
            </div>
            {called && ticket.counterName && (
              <p className="mt-4 text-lg font-semibold">Rendez-vous : {ticket.counterName}</p>
            )}
          </div>

          <p className="mt-5 text-center text-slate-600">{MESSAGES[ticket.status]}</p>

          <dl className="mt-6 divide-y divide-slate-100 rounded-xl bg-white text-sm shadow-sm ring-1 ring-slate-200">
            {[
              ['Pris à', formatTime(ticket.createdAt)],
              ['Appelé à', formatTime(ticket.calledAt)],
              ['Démarré à', formatTime(ticket.startedAt)],
              ['Terminé à', formatTime(ticket.finishedAt)],
            ]
              .filter(([, v]) => v)
              .map(([label, value]) => (
                <div key={label} className="flex justify-between px-4 py-3">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="font-medium text-slate-900">{value}</dd>
                </div>
              ))}
          </dl>

          {lastQr && (
            <Link
              to={`/join/${lastQr}`}
              className="mt-6 block rounded-lg py-3 text-center text-sm font-medium text-brand-700 ring-1 ring-brand-100 hover:bg-brand-50"
            >
              {FINAL.includes(ticket.status) ? 'Prendre un nouveau ticket' : 'Voir les autres services'}
            </Link>
          )}
        </div>
      )}
    </ClientLayout>
  )
}