import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './components/layout/DashboardLayout'
import { adminNav, agentNav } from './config/navigation'
import ServiceDetail from './pages/admin/ServiceDetail'

import Login from './pages/Login'
import Profile from './pages/shared/Profile'
import AdminDashboard from './pages/admin/Dashboard'
import Services from './pages/admin/Services'
import Counters from './pages/admin/Counters'
import Agents from './pages/admin/Agents'
import Tickets from './pages/admin/Tickets'
import Organization from './pages/admin/Organization'
import Workspace from './pages/agent/Workspace'
import History from './pages/agent/History'
import Join from './pages/client/Join'
import TicketTracking from './pages/client/TicketTracking'
import Display from './pages/Display'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/join/:qrToken" element={<Join />} />
          <Route path="/ticket/:id" element={<TicketTracking />} />
          <Route path="/display/:qrToken" element={<Display />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="ADMIN">
                <DashboardLayout navItems={adminNav} roleLabel="Espace administrateur" profilePath="/admin/compte" />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="services" element={<Services />} />
            <Route path="guichets" element={<Counters />} />
            <Route path="agents" element={<Agents />} />
            <Route path="tickets" element={<Tickets />} />
            <Route path="organisation" element={<Organization />} />
            <Route path="compte" element={<Profile />} />
            <Route path="services/:id" element={<ServiceDetail />} />
          </Route>

          <Route
            path="/agent"
            element={
              <ProtectedRoute role="AGENT">
                <DashboardLayout navItems={agentNav} roleLabel="Espace agent" profilePath="/agent/compte" />
              </ProtectedRoute>
            }
          >
            <Route index element={<Workspace />} />
            <Route path="historique" element={<History />} />
            <Route path="compte" element={<Profile />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}