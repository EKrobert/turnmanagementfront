import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Card from './Card'

export default function DataTable({ columns, rows, loading = false, pageSize = 10, empty = 'Aucun résultat.' }) {
  const [page, setPage] = useState(1)

  const total = rows.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * pageSize
  const visibleRows = rows.slice(start, start + pageSize)

  return (
    <Card noPadding>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/70 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {columns.map((c) => (
                <th key={c.header} className={`px-5 py-3 font-medium ${c.className ?? ''}`}>{c.header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={columns.length} className="px-5 py-12 text-center text-slate-400">Chargement...</td></tr>
            ) : total === 0 ? (
              <tr><td colSpan={columns.length} className="px-5 py-12 text-center text-slate-400">{empty}</td></tr>
            ) : (
              visibleRows.map((row) => (
                <tr key={row.id} className="transition hover:bg-slate-50/60">
                  {columns.map((c) => (
                    <td key={c.header} className={`px-5 py-4 text-slate-700 ${c.className ?? ''}`}>{c.render(row)}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && total > pageSize && (
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-sm text-slate-500">
          <span>
            {start + 1}–{Math.min(start + pageSize, total)} sur {total}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-lg p-1.5 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Page précédente"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-20 text-center">Page {currentPage} / {totalPages}</span>
            <button
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-lg p-1.5 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Page suivante"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </Card>
  )
}