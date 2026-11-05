import axios from 'axios'

const publicClient = axios.create({ baseURL: import.meta.env.VITE_API_URL })

export const publicApi = {
  display: (qrToken) => publicClient.get(`/api/public/organizations/${qrToken}/display`).then((r) => r.data),
  services: (qrToken) =>
    publicClient.get(`/api/public/organizations/${qrToken}/services`).then((r) => r.data),
  takeTicket: (qrToken, serviceId) =>
    publicClient.post(`/api/public/organizations/${qrToken}/services/${serviceId}/tickets`).then((r) => r.data),
  getTicket: (id) => publicClient.get(`/api/public/tickets/${id}`).then((r) => r.data),
}