import api from './api'

// This file contains all authentication API calls
export const authService = {
  // Register a new user (student or professor)
  register: (userData) => api.post('/auth/register', userData),
  
  // Login with email and password
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Get current logged-in user details
  getMe: () => api.get('/auth/me'),
}