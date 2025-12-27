import api from './client'

export const createAvailability = (payload) => api.post('/availability', payload)
export const getProfessorAvailability = (professorId) => api.get(`/availability/professor/${professorId}`)
export const getMyAvailability = () => api.get('/availability/my-availability')
export const deleteAvailability = (id) => api.delete(`/availability/${id}`)
