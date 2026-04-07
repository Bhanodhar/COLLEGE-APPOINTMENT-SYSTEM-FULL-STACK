// BookAppointment Component - Allows students to book appointments with professors
// 1. Choose a professor
// 2. Select a time slot from their availability
// 3. Provide a reason for the meeting
// 4. Confirm the booking

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { availabilityService, appointmentService, userService } from '../../services'
import toast from 'react-hot-toast'

export default function BookAppointment() {
  // Get current user from AuthContext
  const { user } = useAuth()
  const formRef = useRef(null)

  // State variables
  const [professors, setProfessors] = useState([])           // List of all professors
  const [selectedProfessor, setSelectedProfessor] = useState(null) // Currently selected professor
  const [availabilitySlots, setAvailabilitySlots] = useState([])   // Their available time slots
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSlot, setSelectedSlot] = useState(null)      // Currently selected slot
  const [bookingReason, setBookingReason] = useState('')      // Why they want to book
  
  // Load professors when component first appears
  useEffect(() => {
    loadProfessors()
  }, [])

  // Fetch list of professors from backend
  const loadProfessors = async () => {
    try {
      setLoading(true)
      const { data } = await userService.getProfessors()
      setProfessors(data.data || [])
      if (!data.data || data.data.length === 0) {
        toast('No professors found in the system', { icon: '⚠️' })
      }
    } catch (error) {
      toast.error('Failed to fetch professors')
    } finally {
      setLoading(false)
    }
  }

  // Fetch available time slots for a selected professor
  const loadAvailability = async (professorId) => {
    try {
      setLoading(true)
      const { data } = await availabilityService.getProfessorAvailability(professorId)
      // Only show slots that aren't already booked
      const availableSlots = data.data.filter(slot => !slot.isBooked)
      setAvailabilitySlots(availableSlots)
    } catch (error) {
      toast.error('Failed to fetch availability')
    } finally {
      setLoading(false)
    }
  }

  // When a professor is selected, load their availability
  const handleSelectProfessor = (professor) => {
    setSelectedProfessor(professor)
    setSelectedSlot(null) // Reset slot selection
    setBookingReason('')  // Reset reason
    loadAvailability(professor._id)
  }

  // Search professors by name or department
  const handleSearch = (value) => {
    setSearchTerm(value)
    if (value.trim() === '') {
      loadProfessors()
    } else {
      const filtered = professors.filter(prof =>
        prof.name.toLowerCase().includes(value.toLowerCase()) ||
        prof.department.toLowerCase().includes(value.toLowerCase())
      )
      setProfessors(filtered)
    }
  }

  // Book the appointment
  const handleBookAppointment = async () => {
    // Validate inputs
    if (!selectedSlot) {
      toast.error('Please select a time slot')
      return
    }
    if (!bookingReason.trim()) {
      toast.error('Please provide a reason for the appointment')
      return
    }

    try {
      setLoading(true)
      // Send booking request to backend
      const appointmentData = {
        availabilityId: selectedSlot._id,
        reason: bookingReason
      }
      
      await appointmentService.book(appointmentData)
      toast.success('Appointment booked successfully!')
      
      // Reset form
      setSelectedSlot(null)
      setBookingReason('')
      setSelectedProfessor(null)
      setAvailabilitySlots([])
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to book appointment')
    } finally {
      setLoading(false)
    }
  }

  // Format date and time nicely
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div ref={formRef} className="page-content">
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-10">📚 Book an Appointment</h1>

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Left Section - Professor Selection */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-lg border-2 border-blue-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">👨‍🏫 Select Professor</h2>
            
            {/* Search professors */}
            <input
              type="text"
              placeholder="Search by name or department..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg mb-4 focus:border-blue-500"
            />

            {/* List of professors */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {professors.length === 0 ? (
                <div className="text-center text-gray-600 py-8">No professors found</div>
              ) : (
                professors.map(prof => (
                  <button
                    key={prof._id}
                    onClick={() => handleSelectProfessor(prof)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      selectedProfessor?._id === prof._id
                        ? 'border-blue-600 bg-blue-100'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className="font-bold text-gray-900">{prof.name}</div>
                    <div className="text-sm text-gray-700">{prof.department}</div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Section - Availability and Booking */}
        <div className="md:col-span-2">
          {!selectedProfessor ? (
            <div className="bg-gray-50 p-8 rounded-lg border-2 border-dashed border-gray-300 text-center">
              <p className="text-lg text-gray-700 font-medium">👈 Select a professor to see available time slots</p>
            </div>
          ) : loading ? (
            <div className="text-center py-8">Loading availability...</div>
          ) : availabilitySlots.length === 0 ? (
            <div className="bg-orange-50 p-8 rounded-lg border-2 border-dashed border-orange-300 text-center">
              <p className="text-lg text-orange-800 font-medium">No available slots for this professor</p>
            </div>
          ) : (
            <div>
              {/* Available Time Slots */}
              <div className="bg-white p-6 rounded-lg border-2 border-green-200 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">⏰ Available Time Slots</h3>
                <div className="space-y-3">
                  {availabilitySlots.map(slot => (
                    <button
                      key={slot._id}
                      onClick={() => setSelectedSlot(slot)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        selectedSlot?._id === slot._id
                          ? 'border-green-600 bg-green-100'
                          : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                      }`}
                    >
                      <div className="font-bold text-gray-900">📅 {formatTime(slot.startTime)}</div>
                      <div className="text-sm text-gray-700">Ends: {formatTime(slot.endTime)}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Booking Reason */}
              {selectedSlot && (
                <div className="bg-white p-6 rounded-lg border-2 border-purple-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">📝 Why do you want to meet?</h3>
                  <textarea
                    value={bookingReason}
                    onChange={(e) => setBookingReason(e.target.value)}
                    placeholder="Tell the professor why you want to meet..."
                    rows={4}
                    className="w-full px-3 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 mb-4"
                  />
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setSelectedSlot(null)
                        setBookingReason('')
                      }}
                      className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleBookAppointment}
                      disabled={loading || !bookingReason.trim()}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold disabled:opacity-50"
                    >
                      {loading ? 'Booking...' : '✅ Book Appointment'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
