import api from './axios'

export const agentsApi = {
  list: () => api.get('/api/admin/agents').then((r) => r.data),
  create: (data) => api.post('/api/admin/agents', data).then((r) => r.data),
  update: (id, data) => api.put(`/api/admin/agents/${id}`, data).then((r) => r.data),
}