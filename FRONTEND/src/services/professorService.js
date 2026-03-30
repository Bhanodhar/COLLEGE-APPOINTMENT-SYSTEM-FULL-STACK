import api from './api'

export const professorService = {
  getAllProfessors: () => api.get('/auth/professors'),
}
