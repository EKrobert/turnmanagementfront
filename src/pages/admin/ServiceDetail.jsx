import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'

export default function ServiceDetail() {
  const { id } = useParams()
  return (
    <>
      <Link to="/admin/services" className="mb-4 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Retour aux services
      </Link>
      <PageHeader title={`Service #${id}`} subtitle="Guichets et tickets de ce service." />
      <Card>
        <p className="py-6 text-center text-slate-400">Détails à venir (guichets, tickets).</p>
      </Card>
    </>
  )
}