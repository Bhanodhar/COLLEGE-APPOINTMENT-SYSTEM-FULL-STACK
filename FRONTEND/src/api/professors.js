import api from '../services/api'

export const getAllProfessors = () => api.get('/auth/professors')
