import Badge from '../ui/Badge'
import { STATUS } from '../../utils/ticket'

export default function StatusBadge({ status }) {
  const s = STATUS[status] ?? { label: status, tone: 'slate' }
  return <Badge tone={s.tone}>{s.label}</Badge>
}