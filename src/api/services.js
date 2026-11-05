import api from './axios'

export const servicesApi = {
  list: () => api.get('/api/admin/services').then((r) => r.data),
  create: (data) => api.post('/api/admin/services', data).then((r) => r.data),
  update: (id, data) => api.put(`/api/admin/services/${id}`, data).then((r) => r.data),
}