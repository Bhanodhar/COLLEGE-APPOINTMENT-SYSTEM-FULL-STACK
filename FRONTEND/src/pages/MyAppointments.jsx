import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useGSAP } from '../contexts/AnimationContext'
import { appointmentService } from '../services/appointmentService'
import toast from 'react-hot-toast'
import { 
  Calendar, 
  Clock, 
  User, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  ChevronDown
} from 'lucide-react'
import { format, parseISO, isPast, isFuture } from 'date-fns'

export default function MyAppointments() {
  const { user } = useAuth()
  const { animatePageEnter } = useGSAP()
  const [appointments, setAppointments] = useState([])
  const [filteredAppointments, setFilteredAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const containerRef = useRef(null)

  const fetchAppointments = async () => {
    try {
      const endpoint = user.role === 'student' 
        ? appointmentService.getStudentAppointments
        : appointmentService.getProfessorAppointments
      
      const { data } = await endpoint()
      console.log('Fetched appointments:', data.data) 
      setAppointments(data.data || [])
    } catch (error) {
      toast.error('Failed to fetch appointments')
    } finally {
      setLoading(false)
    }
  }

  
  useEffect(() => {
    fetchAppointments()
    if (containerRef.current) {
      animatePageEnter(containerRef.current)
    }
  }, [])

  if (!user) {
    return <div className="p-8 text-center">Loading user session...</div>
  }

  useEffect(() => {
    filterAppointments()
  }, [appointments, searchTerm, statusFilter, dateFilter])

  

  const filterAppointments = () => {
    let filtered = [...appointments]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(apt => {
        const searchString = searchTerm.toLowerCase()
        const otherPerson = user.role === 'student' 
          ? apt.professor?.name || ''
          : apt.student?.name || ''
        
        return (
          otherPerson.toLowerCase().includes(searchString) ||
          (apt.reason || '').toLowerCase().includes(searchString)
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
            return isFuture(aptDate) && apt.status === 'scheduled'
          case 'past':
            return isPast(aptDate)
          case 'today':
            return aptDate.toDateString() === now.toDateString()
          default:
            return true
        }
      })
    }

    setFilteredAppointments(filtered)
  }

  const getStatusBadge = (status) => {
    const badges = {
      scheduled: {
        text: 'Scheduled',
        className: 'badge badge-info',
        icon: Clock
      },
      completed: {
        text: 'Completed',
        className: 'badge badge-success',
        icon: CheckCircle
      },
      cancelled: {
        text: 'Cancelled',
        className: 'badge badge-danger',
        icon: XCircle
      }
    }
    
    const badge = badges[status] || badges.scheduled
    const Icon = badge.icon
    
    return (
      <span className={badge.className}>
        <Icon className="h-3 w-3 mr-1" />
        {badge.text}
      </span>
    )
  }

  const formatAppointmentTime = (date) => {
    return format(parseISO(date), 'MMM d, yyyy • h:mm a')
  }

  const getOtherPerson = (appointment) => {
    return user.role === 'student' 
      ? appointment.professor
      : appointment.student
  }

  const handleCancelAppointment = async (appointmentId, reason) => {
    if (!reason || !reason.trim()) {
      toast.error('Please provide a cancellation reason')
      return
    }

    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await appointmentService.cancel(appointmentId, reason)
        toast.success('Appointment cancelled successfully')
        fetchAppointments()
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to cancel appointment')
      }
    }
  }

  return (
    <div ref={containerRef} className="page-content space-y-8"> 
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          {user.role === 'student' ? '📅 My Appointments' : '👥 Student Appointments'}
        </h1>
        <p className="text-lg text-gray-700 font-medium">
          View and manage all your scheduled meetings
        </p>
      </div>

      {/* Filters */}
      <div className="card border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-white">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
          <span className="bg-purple-100 p-2 rounded-lg mr-3">
            <Filter className="h-5 w-5 text-purple-600" />
          </span>
          Filter Appointments
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Search */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              🔍 Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-600" />
              <input
                type="text"
                placeholder={`Search by ${user.role === 'student' ? 'professor' : 'student'} name...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 border-2 border-purple-100 focus:border-purple-500 rounded-xl text-gray-900"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              📋 Status
            </label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-600" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field pl-10 border-2 border-purple-100 focus:border-purple-500 rounded-xl text-gray-900"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              📆 Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-600" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="input-field pl-10 border-2 border-purple-100 focus:border-purple-500 rounded-xl text-gray-900"
              >
                <option value="all">All Dates</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
                <option value="today">Today</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="card border-2 border-blue-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <span className="bg-blue-100 p-2 rounded-lg mr-3">
              <Calendar className="h-6 w-6 text-blue-600" />
            </span>
            {filteredAppointments.length} Appointment{filteredAppointments.length !== 1 ? 's' : ''}
          </h2>
          <div className="text-sm font-semibold text-gray-700 bg-gray-100 px-4 py-2 rounded-lg">
            Showing {filteredAppointments.length} of {appointments.length}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-700 font-medium">Loading appointments...</p>
            </div>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-b from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-300">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Appointments Found</h3>
            <p className="text-gray-700 font-medium mb-6">
              {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                ? 'Try adjusting your search filters'
                : user.role === 'student'
                ? 'Book your first appointment with a professor to get started'
                : 'Your appointment schedule will appear here'}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredAppointments.map((appointment, index) => {
              const otherPerson = getOtherPerson(appointment)
              const isCancellable = user.role === 'professor' && 
                appointment.status === 'scheduled' && 
                isFuture(new Date(appointment.appointmentTime))
              
              const statusColors = {
                scheduled: 'border-l-4 border-l-blue-500 bg-blue-50 hover:bg-blue-100',
                completed: 'border-l-4 border-l-green-500 bg-green-50 hover:bg-green-100',
                cancelled: 'border-l-4 border-l-red-500 bg-red-50 hover:bg-red-100'
              }

              return (
                <div
                  key={appointment._id}
                  className={`border-2 border-gray-200 rounded-xl p-6 transition-all duration-300 ${statusColors[appointment.status] || statusColors.scheduled}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className={`p-3 rounded-lg ${
                          appointment.status === 'scheduled' ? 'bg-blue-500' : 
                          appointment.status === 'completed' ? 'bg-green-500' : 'bg-red-500'
                        }`}>
                          <Calendar className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">
                                {formatAppointmentTime(appointment.appointmentTime)}
                              </h3>
                              <p className="text-gray-800 mt-2 font-semibold">
                                {user.role === 'student' ? '👨‍🏫' : '👨‍🎓'} With{' '}
                                <span className="text-blue-600">
                                  {otherPerson?.name || 'N/A'}
                                </span>
                                {otherPerson?.department && (
                                  <span className="text-gray-700">
                                    {' '}• {otherPerson.department}
                                  </span>
                                )}
                              </p>
                            </div>
                            <div>
                              {getStatusBadge(appointment.status)}
                            </div>
                          </div>

                          {appointment.reason && (
                            <div className="mt-4 p-4 bg-white rounded-lg border-l-4 border-l-blue-400 shadow-sm">
                              <p className="text-sm text-gray-700">
                                <span className="font-bold text-blue-600">📝 Appointment Reason:</span> {appointment.reason}
                              </p>
                            </div>
                          )}

                          {appointment.cancellationReason && (
                            <div className="mt-4 p-4 bg-red-100 rounded-lg border-l-4 border-l-red-600 shadow-sm">
                              <div className="flex items-start space-x-3">
                                <AlertCircle className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="text-sm font-bold text-red-800">
                                    ⛔ Cancellation Reason
                                  </p>
                                  <p className="text-sm text-red-700 mt-1">
                                    {appointment.cancellationReason}
                                  </p>
                                  {appointment.cancelledBy && (
                                    <p className="text-xs text-red-600 mt-2 font-semibold">
                                      Cancelled by: {appointment.cancelledBy.name}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {isCancellable && (
                      <div className="ml-4">
                        <button
                          onClick={() => {
                            const reason = prompt('Please provide a cancellation reason:')
                            if (reason) {
                              handleCancelAppointment(appointment._id, reason)
                            }
                          }}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all transform hover:scale-105 whitespace-nowrap"
                        >
                          ✕ Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{appointments.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Scheduled</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {appointments.filter(a => a.status === 'scheduled').length}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Completed</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {appointments.filter(a => a.status === 'completed').length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Cancelled</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {appointments.filter(a => a.status === 'cancelled').length}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}