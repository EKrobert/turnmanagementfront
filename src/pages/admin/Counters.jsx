import { useEffect, useState } from 'react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import CountersPanel from '../../components/counters/CountersPanel'
import { servicesApi } from '../../api/services'
import { getErrorMessage } from '../../utils/errors'

export default function Counters() {
  const [services, setServices] = useState([])
  const [serviceId, setServiceId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    servicesApi
      .list()
      .then((list) => {
        setServices(list)
        if (list.length > 0) setServiceId(String(list[0].id))
      })
      .catch((err) => setError(getErrorMessage(err, 'Impossible de charger les services.')))
      .finally(() => setLoading(false))
  }, [])

  const selector = (
    <Input as="select" aria-label="Service" value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
      {services.map((s) => (
        <option key={s.id} value={s.id}>{s.name}{s.active ? '' : ' (inactif)'}</option>
      ))}
    </Input>
  )

  return (
    <>
      <PageHeader title="Guichets" subtitle="Créez des guichets et affectez-leur des agents." />

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">{error}</div>
      )}

      {loading ? (
        <Card><p className="py-6 text-center text-slate-400">Chargement...</p></Card>
      ) : services.length === 0 ? (
        <Card><p className="py-6 text-center text-slate-400">Créez d'abord un service pour y ajouter des guichets.</p></Card>
      ) : (
        <CountersPanel key={serviceId} serviceId={serviceId} toolbar={selector} />
      )}
    </>
  )
}