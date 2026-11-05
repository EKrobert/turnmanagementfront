import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import { useAuth } from '../../context/AuthContext'

export default function Profile() {
  const { user } = useAuth()

  return (
    <>
      <PageHeader title="Mon compte" subtitle="Vos informations de connexion." />
      <Card className="max-w-xl">
        <div className="space-y-4">
          <Input label="Nom" value={user?.name ?? ''} readOnly />
          <Input label="Email" value={user?.email ?? ''} readOnly />
          <div>
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Rôle</span>
            <Badge tone="indigo">{user?.role}</Badge>
          </div>
        </div>
      </Card>
    </>
  )
}