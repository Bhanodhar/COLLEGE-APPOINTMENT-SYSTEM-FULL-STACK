import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useGSAP } from '../../contexts/AnimationContext'
import { availabilityService, appointmentService } from '../../services'
import { userService } from '../../services/userService'
import toast from 'react-hot-toast'
import { 
  Search, 
  Calendar, 
  Clock, 
  User, 
  GraduationCap,
  ChevronDown,
  Filter,
  X
} from 'lucide-react'
import { format, parseISO, isAfter, isBefore } from 'date-fns'

export default function BookAppointment() {
  const { user } = useAuth()
  const { animatePageEnter } = useGSAP()
  const [professors, setProfessors] = useState([])
  const [selectedProfessor, setSelectedProfessor] = useState(null)
  const [availabilitySlots, setAvailabilitySlots] = useState([])
  const [filteredSlots, setFilteredSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('all')
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [bookingReason, setBookingReason] = useState('')
  const formRef = useRef(null)

  useEffect(() => {
    fetchProfessors()
    if (formRef.current) {
      animatePageEnter(formRef.current)
    }
  }, [])

  useEffect(() => {
    if (selectedProfessor) {
      fetchProfessorAvailability(selectedProfessor._id)
    }
  }, [selectedProfessor])

  const fetchProfessors = async () => {
    try {
      // In a real app, you would have an API endpoint for this
      // For now, we'll simulate by filtering users
      const professorsData = [
        {
          _id: '1',
          name: 'Dr. Smith',
          email: 'smith@college.edu',
          department: 'Computer Science',
          role: 'professor'
        },
        {
          _id: '2',
          name: 'Dr. Johnson',
          email: 'johnson@college.edu',
          department: 'Mathematics',
          role: 'professor'
        },
        {
          _id: '3',
          name: 'Dr. Williams',
          email: 'williams@college.edu',
          department: 'Physics',
          role: 'professor'
        }
      ]
      setProfessors(professorsData)
    } catch (error) {
      toast.error('Failed to fetch professors')
    }
  }

  const fetchProfessorAvailability = async (professorId) => {
    try {
      setLoading(true)
      const { data } = await availabilityService.getProfessorAvailability(professorId)
      const availableSlots = data.data.filter(slot => !slot.isBooked)
      setAvailabilitySlots(availableSlots)
      setFilteredSlots(availableSlots)
      setLoading(false)
    } catch (error) {
      toast.error('Failed to fetch availability')
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    if (!selectedProfessor) {
      const filtered = professors.filter(professor =>
        professor.name.toLowerCase().includes(e.target.value.toLowerCase()) ||
        professor.department.toLowerCase().includes(e.target.value.toLowerCase())
      )
      setProfessors(filtered)
    }
  }

  const handleDateFilter = (filter) => {
    setDateFilter(filter)
    let filtered = [...availabilitySlots]
    
    const now = new Date()
    switch (filter) {
      case 'today':
        filtered = filtered.filter(slot => {
          const slotDate = new Date(slot.startTime)
          return slotDate.toDateString() === now.toDateString()
        })
        break
      case 'tomorrow':
        const tomorrow = new Date(now)
        tomorrow.setDate(tomorrow.getDate() + 1)
        filtered = filtered.filter(slot => {
          const slotDate = new Date(slot.startTime)
          return slotDate.toDateString() === tomorrow.toDateString()
        })
        break
      case 'this-week':
        const weekEnd = new Date(now)
        weekEnd.setDate(weekEnd.getDate() + 7)
        filtered = filtered.filter(slot => {
          const slotDate = new Date(slot.startTime)
          return isAfter(slotDate, now) && isBefore(slotDate, weekEnd)
        })
        break
      default:
        filtered = availabilitySlots
    }
    
    setFilteredSlots(filtered)
  }

  const handleBookAppointment = async () => {
    if (!selectedSlot || !bookingReason.trim()) {
      toast.error('Please select a time slot and provide a reason')
      return
    }

    try {
      setLoading(true)
      const appointmentData = {
        availabilitySlot: selectedSlot._id,
        appointmentTime: selectedSlot.startTime,
        reason: bookingReason
      }
      
      await appointmentService.book(appointmentData)
      toast.success('Appointment booked successfully!')
      
      // Reset form
      setSelectedSlot(null)
      setBookingReason('')
      
      // Refresh availability
      if (selectedProfessor) {
        fetchProfessorAvailability(selectedProfessor._id)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to book appointment')
    } finally {
      setLoading(false)
    }
  }

  const formatSlotTime = (slot) => {
    const start = format(parseISO(slot.startTime), 'MMM d, yyyy • h:mm a')
    const end = format(parseISO(slot.endTime), 'h:mm a')
    return `${start} - ${end}`
  }

  return (
    <div ref={formRef} className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Book Appointment</h1>
        <p className="text-gray-600 mt-2">
          Schedule a meeting with professors based on their availability
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Professor Selection */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Professor</h2>
            
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search professors..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* Professor List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {professors.map((professor) => (
                <button
                  key={professor._id}
                  onClick={() => setSelectedProfessor(professor)}
                  className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                    selectedProfessor?._id === professor._id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary-100 p-2 rounded-full">
                      <User className="h-5 w-5 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{professor.name}</h3>
                      <p className="text-sm text-gray-600">{professor.department}</p>
                    </div>
                    {selectedProfessor?._id === professor._id && (
                      <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Selected Professor Info */}
            {selectedProfessor && (
              <div className="mt-6 pt-6 border-t">
                <div className="bg-primary-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <GraduationCap className="h-5 w-5 text-primary-600" />
                    <h3 className="font-semibold text-gray-900">Selected Professor</h3>
                  </div>
                  <p className="text-gray-900 font-medium">{selectedProfessor.name}</p>
                  <p className="text-sm text-gray-600">{selectedProfessor.department}</p>
                  <p className="text-sm text-gray-500 mt-1">{selectedProfessor.email}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Availability Slots */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Available Time Slots
                {selectedProfessor && (
                  <span className="text-primary-600"> • {selectedProfessor.name}</span>
                )}
              </h2>
              
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={dateFilter}
                  onChange={(e) => handleDateFilter(e.target.value)}
                  className="input-field py-1 text-sm"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="tomorrow">Tomorrow</option>
                  <option value="this-week">This Week</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
              </div>
            ) : !selectedProfessor ? (
              <div className="text-center py-12">
                <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Professor</h3>
                <p className="text-gray-600">Choose a professor from the left panel to view their available time slots</p>
              </div>
            ) : filteredSlots.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Available Slots</h3>
                <p className="text-gray-600">This professor doesn't have any available time slots at the moment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSlots.map((slot) => (
                  <div
                    key={slot._id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                      selectedSlot?._id === slot._id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <Clock className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{formatSlotTime(slot)}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            Duration: {Math.round((new Date(slot.endTime) - new Date(slot.startTime)) / (1000 * 60))} minutes
                          </p>
                        </div>
                      </div>
                      {selectedSlot?._id === slot._id && (
                        <div className="bg-primary-600 text-white p-1 rounded-full">
                          <X className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Booking Form */}
            {selectedSlot && (
              <div className="mt-8 pt-8 border-t">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Appointment</h3>
                
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Selected Time Slot</h4>
                    <p className="text-gray-700">{formatSlotTime(selectedSlot)}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      With: {selectedProfessor?.name}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Appointment
                    </label>
                    <textarea
                      value={bookingReason}
                      onChange={(e) => setBookingReason(e.target.value)}
                      placeholder="Please provide a brief reason for this appointment..."
                      rows={3}
                      className="input-field"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      This will help the professor prepare for your meeting
                    </p>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={() => {
                        setSelectedSlot(null)
                        setBookingReason('')
                      }}
                      className="btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleBookAppointment}
                      disabled={loading || !bookingReason.trim()}
                      className="btn-primary flex-1"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                          <span className="ml-2">Booking...</span>
                        </div>
                      ) : (
                        'Confirm Booking'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}