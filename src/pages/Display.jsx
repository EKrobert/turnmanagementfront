import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Megaphone, Users, Volume2, VolumeX } from 'lucide-react'
import { publicApi } from '../api/public'
import { useRealtime } from '../hooks/useRealtime'
import { formatTicketNumber } from '../utils/ticket'

const FALLBACK_MS = 30000
const BANNER_MS = 8000
const SPEECH_MAX_MS = 15000

export default function Display() {
  const { qrToken } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [now, setNow] = useState(new Date())
  const [soundOn, setSoundOn] = useState(false)
  const [queue, setQueue] = useState([]) // annonces en attente
  const [current, setCurrent] = useState(null) // annonce affichée
  const timer = useRef(null)
  const announced = useRef(null) // null tant que le premier chargement n'est pas fait
  const soundRef = useRef(false)

  useEffect(() => {
    soundRef.current = soundOn
  }, [soundOn])

  const load = useCallback(async () => {
    clearTimeout(timer.current)
    try {
      const result = await publicApi.display(qrToken)
      setData(result)
      setError('')

      // Détecte les nouveaux appels (guichet au statut CALLED jamais annoncé)
      const calls = result.services.flatMap((s) =>
        s.counters
          .filter((c) => c.status === 'CALLED')
          .map((c) => ({
            key: `${c.counterId}:${c.ticketNumber}:${c.calledAt}`,
            counterId: c.counterId,
            counterName: c.name,
            serviceName: s.name,
            number: c.ticketNumber,
          }))
      )
      if (announced.current === null) {
        announced.current = new Set(calls.map((c) => c.key)) // rechargement : pas de ré-annonce
      } else {
        const fresh = calls.filter((c) => !announced.current.has(c.key))
        fresh.forEach((c) => announced.current.add(c.key))
        if (fresh.length) setQueue((q) => [...q, ...fresh])
      }
    } catch (err) {
      setError(err.response?.status === 404 ? "Cet établissement n'existe pas." : 'Connexion perdue...')
    }
    timer.current = setTimeout(load, FALLBACK_MS)
  }, [qrToken])

  useEffect(() => {
    load()
    return () => clearTimeout(timer.current)
  }, [load])

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  useRealtime([`/topic/organizations/${qrToken}/display`], load)

  // File d'annonces : une seule à la fois
  useEffect(() => {
    if (!current && queue.length > 0) {
      setCurrent(queue[0])
      setQueue((q) => q.slice(1))
    }
  }, [current, queue])

  // Une annonce se termine quand le banner a duré BANNER_MS ET que la voix a fini
  useEffect(() => {
    if (!current) return
    let cancelled = false
    const minimum = new Promise((resolve) => setTimeout(resolve, BANNER_MS))
    const spoken = new Promise((resolve) => {
      if (!soundRef.current || !('speechSynthesis' in window)) return resolve()
      const u = new SpeechSynthesisUtterance(
        `${current.serviceName}, numéro ${current.number}, ${current.counterName}`
      )
      u.lang = 'fr-FR'
      u.onend = resolve
      u.onerror = resolve
      window.speechSynthesis.speak(u)
      setTimeout(resolve, SPEECH_MAX_MS) // sécurité si la voix ne se termine jamais
    })
    Promise.all([minimum, spoken]).then(() => {
      if (!cancelled) setCurrent(null)
    })
    return () => {
      cancelled = true
    }
  }, [current])

  const toggleSound = () => {
    if (!soundOn && 'speechSynthesis' in window) {
      // Un clic est nécessaire pour que le navigateur autorise le son
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(''))
    }
    setSoundOn((v) => !v)
  }

  const services = data?.services ?? []

  return (
    <div className="flex min-h-screen flex-col bg-brand-900 text-white">
      <header className="flex items-center justify-between px-10 py-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
            <Users className="h-6 w-6" />
          </div>
          <span className="text-3xl font-bold">{data?.organizationName ?? 'QueueFlow'}</span>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={toggleSound}
            className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
          >
            {soundOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            {soundOn ? 'Son activé' : 'Activer le son'}
          </button>
          <span className="text-4xl font-semibold tabular-nums">
            {now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </header>

      {current && (
        <div className="mx-10 mb-6 flex items-center justify-center gap-8 rounded-3xl bg-white px-10 py-6 text-brand-900 shadow-2xl">
          <Megaphone className="h-14 w-14 text-brand-600" />
          <div className="text-center">
            <p className="text-3xl text-slate-500">{current.serviceName}</p>
            <p className="text-8xl font-extrabold leading-none">{formatTicketNumber(current.number)}</p>
          </div>
          <p className="rounded-2xl bg-brand-600 px-8 py-4 text-5xl font-bold text-white">{current.counterName}</p>
        </div>
      )}

      {error && !data ? (
        <p className="flex flex-1 items-center justify-center text-3xl text-indigo-200">{error}</p>
      ) : services.length === 0 ? (
        <p className="flex flex-1 items-center justify-center text-3xl text-indigo-200">
          Aucun guichet ouvert pour le moment
        </p>
      ) : (
        <main className="grid flex-1 content-start gap-6 px-10 pb-10 [grid-template-columns:repeat(auto-fit,minmax(22rem,1fr))]">
          {services.map((s) => (
            <section key={s.serviceId} className="rounded-3xl bg-white/10 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-3xl font-bold">{s.name}</h2>
                <span className="rounded-full bg-white/15 px-4 py-1 text-lg">{s.waiting} en attente</span>
              </div>
              <div className="space-y-3">
                {s.counters.map((c) => {
                  const calling = c.status === 'CALLED'
                  const serving = c.status === 'IN_PROGRESS'
                  const highlight = current?.counterId === c.counterId
                  return (
                    <div
                      key={c.counterId}
                      className={`flex items-center justify-between rounded-2xl px-6 py-4 transition ${
                        calling
                          ? 'bg-white text-brand-900'
                          : serving
                            ? 'bg-white/15 text-indigo-100'
                            : 'bg-white/5 text-indigo-300'
                      } ${highlight ? 'animate-pulse ring-4 ring-amber-300' : ''}`}
                    >
                      <span className="text-2xl font-semibold">{c.name}</span>
                      {calling ? (
                        <span className="text-5xl font-extrabold">{formatTicketNumber(c.ticketNumber)}</span>
                      ) : serving ? (
                        <span className="text-xl">En service · {formatTicketNumber(c.ticketNumber)}</span>
                      ) : (
                        <span className="text-xl">Disponible</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
        </main>
      )}
    </div>
  )
}