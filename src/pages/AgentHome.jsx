import { useAuth } from '../context/AuthContext'

export default function AdminHome() {
  const { logout } = useAuth()
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Espace Agent</h1>
      <button onClick={logout} className="mt-4 px-4 py-2 bg-slate-200 rounded">Déconnexion</button>
    </div>
  )
}