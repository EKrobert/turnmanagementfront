import api from './axios'

export const statsApi = {
  get: (period) => api.get('/api/admin/stats', { params: { period } }).then((r) => r.data),
}