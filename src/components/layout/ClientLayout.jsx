import { Users } from 'lucide-react'

export default function ClientLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-brand-900 px-4 py-4 text-white">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
            <Users className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">QueueFlow</span>
        </div>
      </header>
      <main className="mx-auto max-w-md p-4">{children}</main>
    </div>
  )
}