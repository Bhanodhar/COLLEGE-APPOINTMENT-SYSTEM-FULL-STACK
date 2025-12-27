import api from './api'

export const userService = {
  getProfessors: () => api.get('/users/professors'),
  getProfessor: (id) => api.get(`/users/${id}`),
}