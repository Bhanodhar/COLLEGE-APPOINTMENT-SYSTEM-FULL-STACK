import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useAnimation } from '../../contexts/AnimationContext'
import { availabilityService, appointmentService } from '../../services'
import { getAllProfessors } from '../../api/professors'
import toast from 'react-hot-toast'
import { 
  Search, 
  Calendar, 
  Clock, 
  User, 
  GraduationCap,
  ChevronDown,
  Filter,
  X,
  CheckCircle
} from 'lucide-react'
import { format, parseISO, isAfter, isBefore } from 'date-fns'

export default function BookAppointment() {
  const { user } = useAuth()
  const { animatePageEnter } = useAnimation()
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
      setLoading(true)
      const { data } = await getAllProfessors()
      console.log('Professors fetched:', data)
      setProfessors(data.data || [])
      if (!data.data || data.data.length === 0) {
        toast('No professors found in the system', { icon: '⚠️' })
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching professors:', error.response?.data || error.message)
      toast.error(error.response?.data?.message || 'Failed to fetch professors')
      setLoading(false)
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
    <div ref={formRef} className="page-content">
      <div className="space-y-8" >
      <div className="space-y-3">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">📚 Book an Appointment</h1>
        <p className="text-lg text-gray-700 font-medium">
          Connect with accomplished professors and schedule a personalized meeting
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Professor Selection */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24 border-2 border-blue-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="bg-blue-100 p-2 rounded-lg mr-3">
                <User className="h-5 w-5 text-blue-600" />
              </span>
              Select Professor
            </h2>
            
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search professors..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="input-field pl-10 border-2 border-blue-100 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Professor List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {loading && professors.length === 0 ? (
                <div className="flex items-center justify-center h-48">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600 mx-auto mb-3"></div>
                    <p className="text-gray-700 font-medium text-sm">Loading professors...</p>
                  </div>
                </div>
              ) : professors.length === 0 ? (
                <div className="text-center py-8 text-gray-600 font-medium">
                  <p>No professors found</p>
                </div>
              ) : (
                professors.map((professor) => (
                <button
                  key={professor._id}
                  onClick={() => setSelectedProfessor(professor)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                    selectedProfessor?._id === professor._id
                      ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 shadow-md'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2.5 rounded-full ${selectedProfessor?._id === professor._id ? 'bg-blue-500' : 'bg-blue-100'}`}>
                      <User className={`h-5 w-5 ${selectedProfessor?._id === professor._id ? 'text-white' : 'text-blue-600'}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{professor.name}</h3>
                      <p className="text-sm text-gray-700 font-medium">{professor.department}</p>
                    </div>
                    {selectedProfessor?._id === professor._id && (
                      <div className="animate-pulse">
                        <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </button>
              ))
              )}
            </div>

            {/* Selected Professor Info */}
            {selectedProfessor && (
              <div className="mt-6 pt-6 border-t-2 border-blue-100">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-lg">👨‍🏫</span>
                    <h3 className="font-bold text-gray-900">Professor Selected</h3>
                  </div>
                  <p className="text-gray-900 font-bold text-lg">{selectedProfessor.name}</p>
                  <p className="text-sm text-gray-800 mt-1 font-semibold">{selectedProfessor.department}</p>
                  <p className="text-sm text-gray-700 mt-2 font-medium">📧 {selectedProfessor.email}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Availability Slots */}
        <div className="lg:col-span-2">
          <div className="card border-2 border-green-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="bg-green-100 p-2 rounded-lg mr-3">
                  <Calendar className="h-6 w-6 text-green-600" />
                </span>
                Available Time Slots
                {selectedProfessor && (
                  <span className="text-green-600 ml-2">✓</span>
                )}
              </h2>
              
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={dateFilter}
                  onChange={(e) => handleDateFilter(e.target.value)}
                  className="input-field py-2 text-sm border-2 border-green-100 focus:border-green-500"
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
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-700 font-medium">Loading available slots...</p>
                </div>
              </div>
            ) : !selectedProfessor ? (
              <div className="text-center py-16 bg-gradient-to-b from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-300">
                <div className="text-4xl mb-4">👈</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Professor First</h3>
                <p className="text-gray-700 font-medium">Choose a professor from the left panel to see their available time slots</p>
              </div>
            ) : filteredSlots.length === 0 ? (
              <div className="text-center py-16 bg-gradient-to-b from-orange-50 to-white rounded-xl border-2 border-dashed border-orange-300">
                <div className="text-4xl mb-4">📭</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Available Slots</h3>
                <p className="text-gray-700 font-medium">Try selecting a different date or check back later!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSlots.map((slot, index) => (
                  <div
                    key={slot._id}
                    className={`border-2 rounded-xl p-5 cursor-pointer transition-all duration-300 transform hover:scale-102 ${
                      selectedSlot?._id === slot._id
                        ? 'border-green-500 bg-gradient-to-r from-green-50 to-green-100 shadow-lg'
                        : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                    }`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className={`p-3 rounded-lg ${selectedSlot?._id === slot._id ? 'bg-green-500' : 'bg-green-100'}`}>
                          <Clock className={`h-6 w-6 ${selectedSlot?._id === slot._id ? 'text-white' : 'text-green-600'}`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 text-lg">{formatSlotTime(slot)}</p>
                          <p className="text-sm text-gray-700 mt-1 font-medium">
                            ⏱️ Duration: {Math.round((new Date(slot.endTime) - new Date(slot.startTime)) / (1000 * 60))} minutes
                          </p>
                        </div>
                      </div>
                      {selectedSlot?._id === slot._id && (
                        <div className="bg-green-500 text-white p-2 rounded-full animate-pulse">
                          <Calendar className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Booking Form */}
            {selectedSlot && (
              <div className="mt-8 pt-8 border-t-2 border-green-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="bg-green-100 p-2 rounded-lg mr-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </span>
                  Confirm Your Appointment
                </h3>
                
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-5 border-2 border-green-200">
                    <h4 className="font-bold text-gray-900 mb-3 text-lg">📅 Selected Time Slot</h4>
                    <p className="text-gray-900 font-bold text-lg">{formatSlotTime(selectedSlot)}</p>
                    <p className="text-gray-700 mt-2 font-semibold">
                      👨‍🏫 With: {selectedProfessor?.name}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">
                      📝 Reason for Appointment
                    </label>
                    <textarea
                      value={bookingReason}
                      onChange={(e) => setBookingReason(e.target.value)}
                      placeholder="Tell us why you'd like to meet with this professor..."
                      rows={4}
                      className="input-field border-2 border-blue-100 focus:border-blue-500 rounded-xl"
                    />
                    <p className="text-sm text-gray-600 mt-2">
                      💡 This helps the professor prepare a better meeting for you
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        setSelectedSlot(null)
                        setBookingReason('')
                      }}
                      className="flex-1 btn-secondary rounded-xl font-bold text-lg py-3 border-2 border-gray-300 hover:border-gray-400"
                    >
                      ❌ Cancel
                    </button>
                    <button
                      onClick={handleBookAppointment}
                      disabled={loading || !bookingReason.trim()}
                      className="flex-1 btn-primary rounded-xl font-bold text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-transform"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                          <span className="ml-2">Booking...</span>
                        </div>
                      ) : (
                        '✅ Confirm Booking'
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
  </div>
)}
