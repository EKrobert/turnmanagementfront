import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

// Avant chaque requête : ajoute le token s'il existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Après chaque réponse : si 401 sur une route protégée, on déconnecte
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("STATUS HTTP :", error.response?.status)
    console.log("MESSAGE :", error.response?.data)

    const url = error.config?.url || ''
    const isLogin = url.includes('/api/auth/login')

    if (error.response?.status === 401 && !isLogin) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

export default api