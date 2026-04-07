// MyAppointments Component - Shows all appointments for the current user
// Students see their appointments with professors
// Professors see appointments with students

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { appointmentService } from '../services'
import toast from 'react-hot-toast'

export default function MyAppointments() {
  // Get current user from AuthContext
  const { user } = useAuth()
  const containerRef = useRef(null)

  // State variables
  const [appointments, setAppointments] = useState([])          // All appointments
  const [filteredAppointments, setFilteredAppointments] = useState([]) // Filtered based on search/filters
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')              // Search query
  const [statusFilter, setStatusFilter] = useState('all')       // Filter by status
  const [dateFilter, setDateFilter] = useState('all')           // Filter by date

  // Load appointments when component first appears
  useEffect(() => {
    loadAppointments()
  }, [])

  // Re-filter appointments whenever filters change
  useEffect(() => {
    filterAppointments()
  }, [appointments, searchTerm, statusFilter, dateFilter])

  // Fetch appointments from backend
  const loadAppointments = async () => {
    try {
      // Use different endpoint based on user role
      const endpoint = user.role === 'student'
        ? appointmentService.getStudentAppointments    // For students: their booked appointments
        : appointmentService.getProfessorAppointments  // For professors: their scheduled appointments

      const { data } = await endpoint()
      setAppointments(data.data || [])
    } catch (error) {
      toast.error('Failed to fetch appointments')
    } finally {
      setLoading(false)
    }
  }

  // Filter appointments based on search and filter criteria
  const filterAppointments = () => {
    let filtered = [...appointments]

    // Search filter - search by professor/student name or reason
    if (searchTerm) {
      filtered = filtered.filter(apt => {
        const searchLower = searchTerm.toLowerCase()
        const otherPerson = user.role === 'student' ? apt.professor?.name : apt.student?.name
        return (
          (otherPerson && otherPerson.toLowerCase().includes(searchLower)) ||
          (apt.reason && apt.reason.toLowerCase().includes(searchLower))
        )
      })
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter)
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.appointmentTime)
        switch (dateFilter) {
          case 'upcoming':
            return aptDate > now && apt.status === 'scheduled'
          case 'past':
            return aptDate < now
          case 'today':
            return aptDate.toDateString() === now.toDateString()
          default:
            return true
        }
      })
    }

    setFilteredAppointments(filtered)
  }

  // Cancel an appointment (professors only)
  const handleCancelAppointment = async (appointmentId, reason) => {
    if (!reason || !reason.trim()) {
      toast.error('Please provide a cancellation reason')
      return
    }

    if (window.confirm('Are you sure? This cannot be undone.')) {
      try {
        await appointmentService.cancel(appointmentId, reason)
        toast.success('Appointment cancelled')
        loadAppointments()
      } catch (error) {
        toast.error('Failed to cancel appointment')
      }
    }
  }

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Format date nicely
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  // Check if appointment can be cancelled (must be professor and future and scheduled)
  const canCancel = (apt) => {
    return user.role === 'professor' &&
      apt.status === 'scheduled' &&
      new Date(apt.appointmentTime) > new Date()
  }

  return (
    <div ref={containerRef} className="page-content">
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
        {user.role === 'student' ? '📅 My Appointments' : '👥 Student Appointments'}
      </h1>

      {/* Filters Section */}
      <div className="bg-white p-6 rounded-lg border-2 border-purple-200 mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">🔍 Filter Appointments</h3>
        <div className="grid md:grid-cols-3 gap-4">
          
          {/* Search */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Search</label>
            <input
              type="text"
              placeholder={`Search by ${user.role === 'student' ? 'professor' : 'student'} name...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Date</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500"
            >
              <option value="all">All Dates</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
              <option value="today">Today</option>
            </select>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white p-6 rounded-lg border-2 border-blue-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          All Appointments ({filteredAppointments.length})
        </h2>

        {loading ? (
          <div className="text-center py-12 text-gray-600">Loading appointments...</div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-12 text-gray-700">
            <p className="text-lg font-medium">
              {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                ? '❌ No appointments match your filters'
                : '📭 No appointments yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map(apt => {
              const otherPerson = user.role === 'student' ? apt.professor : apt.student
              return (
                <div key={apt._id} className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      {/* Date and Time */}
                      <div className="font-bold text-lg text-gray-900">
                        📅 {formatDate(apt.appointmentTime)}
                      </div>

                      {/* With Who */}
                      <div className="text-gray-700 mt-2">
                        <span>{user.role === 'student' ? '👨‍🏫' : '👨‍🎓'} With: </span>
                        <span className="font-semibold">{otherPerson?.name || 'Unknown'}</span>
                        {otherPerson?.department && (
                          <span className="text-gray-600"> - {otherPerson.department}</span>
                        )}
                      </div>

                      {/* Status Badge */}
                      <div className="mt-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(apt.status)}`}>
                          {apt.status}
                        </span>
                      </div>

                      {/* Reason (if exists) */}
                      {apt.reason && (
                        <div className="mt-3 text-sm text-gray-700">
                          <span className="font-semibold">💬 Reason: </span>
                          {apt.reason}
                        </div>
                      )}

                      {/* Cancellation Reason (if cancelled) */}
                      {apt.cancellationReason && (
                        <div className="mt-3 p-2 bg-red-100 text-red-800 rounded text-sm">
                          <span className="font-semibold">⛔ Cancelled: </span>
                          {apt.cancellationReason}
                        </div>
                      )}
                    </div>

                    {/* Cancel Button (Professors only) */}
                    {canCancel(apt) && (
                      <button
                        onClick={() => {
                          const reason = prompt('Cancellation reason:')
                          if (reason) {
                            handleCancelAppointment(apt._id, reason)
                          }
                        }}
                        className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold whitespace-nowrap"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
