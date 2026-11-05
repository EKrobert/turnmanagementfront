import api from './axios'

export const countersApi = {
  listByService: (serviceId) => api.get(`/api/admin/services/${serviceId}/counters`).then((r) => r.data),
  create: (serviceId, data) => api.post(`/api/admin/services/${serviceId}/counters`, data).then((r) => r.data),
  update: (id, data) => api.put(`/api/admin/counters/${id}`, data).then((r) => r.data),
  listAgents: (counterId) => api.get(`/api/admin/counters/${counterId}/agents`).then((r) => r.data),
  assignAgent: (counterId, agentId) => api.post(`/api/admin/counters/${counterId}/agents`, { agentId }).then((r) => r.data),
  unassignAgent: (counterId, agentId) => api.delete(`/api/admin/counters/${counterId}/agents/${agentId}`),
}