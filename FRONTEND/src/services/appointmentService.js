import api from './api'

// This file contains all appointment-related API calls
export const appointmentService = {
  // Book a new appointment with a professor
  book: (appointmentData) => api.post('/appointments/book', appointmentData),
  
  // Cancel an existing appointment with a reason
  cancel: (appointmentId, reason) => api.put(`/appointments/${appointmentId}/cancel`, { reason }),
  
  // Get all appointments booked by the current student
  getStudentAppointments: () => api.get('/appointments/my-appointments'),
  
  // Get all appointments for the current professor
  getProfessorAppointments: () => api.get('/appointments/professor-appointments'),
}