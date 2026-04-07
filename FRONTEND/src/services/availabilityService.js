import api from './api'

// This file contains all availability slot API calls
export const availabilityService = {
  // Create new availability slots for professor
  create: (slotData) => api.post('/availability', slotData),
  
  // Get all availability slots for a specific professor
  getProfessorAvailability: (professorId) => api.get(`/availability/professor/${professorId}`),
  
  // Get current professor's own availability slots
  getMyAvailability: () => api.get('/availability/my-availability'),
  
  // Delete an availability slot
  deleteSlot: (slotId) => api.delete(`/availability/${slotId}`),
}
