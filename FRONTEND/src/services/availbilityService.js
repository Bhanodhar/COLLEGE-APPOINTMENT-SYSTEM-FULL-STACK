import api from './api'

export const availabilityService = {
  create: (availabilityData) => api.post('/availability', availabilityData),
  getProfessorAvailability: (professorId) => api.get(`/availability/professor/${professorId}`),
  getMyAvailability: () => api.get('/availability/my-availability'),
  delete: (id) => api.delete(`/availability/${id}`),
}