import api from './axios'

export const agentTicketsApi = {
  assignment: () => api.get('/api/agent/assignment').then((r) => r.data),
  current: () => api.get('/api/agent/tickets/current').then((r) => (r.status === 204 ? null : r.data)),
  queue: () => api.get('/api/agent/queue').then((r) => r.data),
  callNext: () => api.post('/api/agent/tickets/call-next').then((r) => r.data),
  start: (id) => api.post(`/api/agent/tickets/${id}/start`).then((r) => r.data),
  complete: (id) => api.post(`/api/agent/tickets/${id}/complete`).then((r) => r.data),
  skip: (id) => api.post(`/api/agent/tickets/${id}/skip`).then((r) => r.data),
  history: () => api.get('/api/agent/tickets/history').then((r) => r.data),
}