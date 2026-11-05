import api from './axios'

export const ticketsApi = {
  listByService: (serviceId, status) =>
    api
      .get(`/api/admin/services/${serviceId}/tickets`, { params: status ? { status } : {} })
      .then((r) => r.data),
}