import api from './api'

export const appointmentService = {
  book: (appointmentData) => api.post('/appointments/book', appointmentData),
  cancel: (id, reason) => api.put(`/appointments/${id}/cancel`, { reason }),
  getStudentAppointments: () => api.get('/appointments/my-appointments'),
  getProfessorAppointments: () => api.get('/appointments/professor-appointments'),
}