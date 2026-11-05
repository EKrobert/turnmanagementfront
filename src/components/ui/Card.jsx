export default function Card({ title, action, noPadding = false, className = '', children }) {
  return (
    <section className={`rounded-xl bg-white shadow-sm ring-1 ring-slate-200 ${className}`}>
      {(title || action) && (
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-900">{title}</h2>
          {action}
        </header>
      )}
      <div className={noPadding ? '' : 'p-5'}>{children}</div>
    </section>
  )
}