import api from './client'

export const bookAppointment = (payload) => api.post('/appointments/book', payload)
export const cancelAppointment = (id, reason) => api.put(`/appointments/${id}/cancel`, { reason })
export const getStudentAppointments = () => api.get('/appointments/my-appointments')
export const getProfessorAppointments = () => api.get('/appointments/professor-appointments')
