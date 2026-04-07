// ProfessorList Component - Browse professors and their availability
// (Note: Backend doesn't have a public professor list endpoint, so this shows a placeholder)

import React, { useEffect, useState, useRef } from 'react'
import { availabilityService, appointmentService } from '../services'
import toast from 'react-hot-toast'

export default function ProfessorList() {
  // State for professors, selected professor, availability slots, and messages
  const [professors, setProfessors] = useState([])
  const [selected, setSelected] = useState(null)       // Currently selected professor
  const [slots, setSlots] = useState([])               // Their available slots
  const [loading, setLoading] = useState(false)
  const containerRef = useRef()

  // Load professors when component first appears
  useEffect(() => {
    loadProfessors()
  }, [])

  // Try to fetch professors from backend
  // Note: Backend doesn't have a /users/professors endpoint, so this is a placeholder
  const loadProfessors = async () => {
    try {
      setLoading(true)
      // TODO: When backend adds /users/professors endpoint, uncomment this:
      // const res = await userService.getProfessors()
      // setProfessors(res.data.data || [])
      toast.info('Backend feature: Add GET /users/professors endpoint', { icon: '💡' })
    } catch (err) {
      toast.error('Failed to load professors')
    } finally {
      setLoading(false)
    }
  }

  // Fetch availability slots for a selected professor
  const viewSlots = async (prof) => {
    setSelected(prof)
    try {
      setLoading(true)
      const res = await availabilityService.getProfessorAvailability(prof._id)
      setSlots(res.data.data || [])
    } catch (err) {
      toast.error('Failed to load availability slots')
    } finally {
      setLoading(false)
    }
  }

  // Book an appointment for a selected slot
  const handleBook = async (slotId) => {
    try {
      await appointmentService.book({ availabilitySlot: slotId })
      toast.success('Appointment booked successfully!')
      // Refresh the availability list
      if (selected) {
        viewSlots(selected)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed')
    }
  }

  return (
    <div ref={containerRef} className="page-content" style={{ backgroundColor: '#ffffff !important', color: '#000000 !important' }}>
      <h2 className="text-2xl font-bold mb-6 text-gray-900">🎓 Find Professors</h2>

      {/* Placeholder message */}
      <div className="bg-yellow-50 border-2 border-yellow-300 p-4 rounded-lg mb-6">
        <p className="text-sm font-semibold text-gray-900">⚠️ Note: This page needs a backend endpoint</p>
        <p className="text-sm text-gray-700">Backend needs to add: <code className="bg-gray-100 px-2 py-1 rounded">GET /users/professors</code></p>
        <p className="text-sm text-gray-700 mt-2">Once added, professors will appear here and you can view their availability and book appointments.</p>
      </div>

      {loading && (
        <div className="text-center py-8 text-gray-600">Loading...</div>
      )}

      {!loading && professors.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 font-medium mb-4">No professors available yet</p>
          <p className="text-sm text-gray-500">Please contact an administrator to add professors to the system</p>
        </div>
      )}

      {/* Grid of professors */}
      <div className="grid md:grid-cols-2 gap-6">
        {professors.map(prof => (
          <div key={prof._id} className="bg-white p-4 rounded-lg border-2 border-blue-200">
            <div className="font-bold text-lg text-gray-900">👨‍🏫 {prof.name}</div>
            <div className="text-sm text-gray-700 mt-1">📚 {prof.department}</div>
            <div className="text-sm text-gray-700">📧 {prof.email}</div>
            
            <button 
              onClick={() => viewSlots(prof)}
              className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              View Availability
            </button>
          </div>
        ))}
      </div>

      {/* Show availability slots when professor is selected */}
      {selected && (
        <div className="mt-8 bg-green-50 border-2 border-green-300 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4">⏰ Available Slots for {selected.name}</h3>
          
          {slots.length === 0 ? (
            <p className="text-gray-700">No available slots at the moment</p>
          ) : (
            <div className="space-y-3">
              {slots.map(slot => (
                <div key={slot._id} className="bg-white p-3 rounded-lg flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-gray-900">📅 {new Date(slot.startTime).toLocaleString()}</div>
                    <div className="text-sm text-gray-700">Until {new Date(slot.endTime).toLocaleTimeString()}</div>
                  </div>
                  {slot.isBooked ? (
                    <span className="text-red-600 font-semibold">❌ Booked</span>
                  ) : (
                    <button 
                      onClick={() => handleBook(slot._id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                    >
                      Book
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
