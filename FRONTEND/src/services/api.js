import axios from 'axios'

// Create an Axios instance configured for our backend API
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor - runs before every API request
// This adds the authentication token to every request
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token')
    
    // If token exists, add it to request headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response Interceptor - runs after every API response
// This handles errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If server returns 401 (Unauthorized), user's token is invalid
    if (error.response?.status === 401) {
      // Remove token and redirect to login
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api