import api from './api'

export const userService = {
  getProfessors: () => api.get('/auth/professors'),
  getProfessor: (id) => api.get(`/users/${id}`),
}