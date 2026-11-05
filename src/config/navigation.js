import {
  LayoutDashboard, Layers, Monitor, Users, Ticket, Building2, Headset, History,
} from 'lucide-react'

export const adminNav = [
  { to: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: '/admin/services', label: 'Services', icon: Layers },
  { to: '/admin/guichets', label: 'Guichets', icon: Monitor },
  { to: '/admin/agents', label: 'Agents', icon: Users },
  { to: '/admin/tickets', label: 'Historique', icon: Ticket },
  { to: '/admin/organisation', label: 'Établissement', icon: Building2 },
]

export const agentNav = [
  { to: '/agent', label: 'Mon guichet', icon: Headset, end: true },
  { to: '/agent/historique', label: 'Tickets traités', icon: History },
]