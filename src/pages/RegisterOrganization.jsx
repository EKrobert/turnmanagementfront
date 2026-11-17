import { useState } from 'react'
import { Link } from 'react-router-dom'

const inputClass =
  'w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/30'

const labelClass = 'block text-sm font-medium text-slate-700 mb-1'

const points = [
  'Ticket numérique par QR code, sans application à installer',
  "Appel du client suivant en un clic depuis le guichet",
  "Suivi de la file en temps réel et écran d'affichage",
]

export default function RegisterOrganization() {
  const [form, setForm] = useState({
    organizationName: '',
    adminName: '',
    email: '',
    password: '',
    confirm: '',
  })
  const [error, setError] = useState('')

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    // TODO : envoyer le formulaire au backend ici
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Description de l'application */}
      <div className="relative overflow-hidden bg-brand-600 text-white px-8 py-10 lg:p-16 flex flex-col justify-center">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/10" />
        <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-white/10" />

        <div className="relative max-w-md">
          <h1 className="text-3xl lg:text-4xl font-bold">QueueFlow</h1>
          <p className="mt-4 text-lg text-white/90">
            QueueFlow remplace les files d'attente physiques par des tickets numériques. Vos clients
            prennent leur ticket, vos agents les appellent, et chacun suit son tour en temps réel.
          </p>

          <ul className="hidden lg:block mt-8 space-y-4">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3">
                <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-white/20 flex items-center justify-center text-xs">
                  ✓
                </span>
                <span className="text-white/90">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Formulaire */}
      <div className="flex items-center justify-center bg-slate-100 px-4 py-10">
        <form onSubmit={handleSubmit} className="w-full max-w-md bg-white rounded-2xl shadow p-8">
          <h2 className="text-xl font-bold text-slate-800">Inscrire mon organisation</h2>
          <p className="text-sm text-slate-500 mt-1 mb-6">
            Créez votre espace et votre compte administrateur.
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
          )}

          <div className="space-y-4">
            <div>
              <label className={labelClass}>Nom de l'organisation</label>
              <input name="organizationName" required value={form.organizationName} onChange={handleChange} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Votre nom</label>
              <input name="adminName" required value={form.adminName} onChange={handleChange} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Email</label>
              <input type="email" name="email" required value={form.email} onChange={handleChange} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Mot de passe</label>
              <input type="password" name="password" required value={form.password} onChange={handleChange} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Confirmer le mot de passe</label>
              <input type="password" name="confirm" required value={form.confirm} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-6 py-2.5 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-600/40"
          >
            Créer l'organisation
          </button>

          <p className="mt-5 text-center text-sm text-slate-600">
            Déjà inscrit ?{' '}
            <Link to="/login" className="font-medium text-brand-600 hover:underline">
              Se connecter
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}