import api from './axios'

export const organizationApi = {
  get: () => api.get('/api/admin/organization').then((r) => r.data),
  getQr: () => api.get('/api/admin/organization/qr', { responseType: 'blob' }).then((r) => r.data),
}