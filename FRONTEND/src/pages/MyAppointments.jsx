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

  useEffect(() => {
    fetchAppointments()
    if (containerRef.current) {
      animatePageEnter(containerRef.current)
    }
  }, [])

  useEffect(() => {
    filterAppointments()
  }, [appointments, searchTerm, statusFilter, dateFilter])

  const fetchAppointments = async () => {
    try {
      const endpoint = user.role === 'student' 
        ? appointmentService.getStudentAppointments
        : appointmentService.getProfessorAppointments
      
      const { data } = await endpoint()
      setAppointments(data.data || [])
    } catch (error) {
      toast.error('Failed to fetch appointments')
    } finally {
      setLoading(false)
    }
  }

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
    <div ref={containerRef} className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {user.role === 'student' ? 'My Appointments' : 'Student Appointments'}
        </h1>
        <p className="text-gray-600 mt-2">
          Manage and view all your scheduled appointments
        </p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={`Search by ${user.role === 'student' ? 'professor' : 'student'} name or reason...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field pl-10"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="input-field pl-10"
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
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {filteredAppointments.length} Appointment{filteredAppointments.length !== 1 ? 's' : ''}
          </h2>
          <div className="text-sm text-gray-600">
            Showing {filteredAppointments.length} of {appointments.length}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                ? 'Try changing your search filters'
                : user.role === 'student'
                ? 'Book your first appointment with a professor'
                : 'Your appointment schedule will appear here'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => {
              const otherPerson = getOtherPerson(appointment)
              const isCancellable = user.role === 'professor' && 
                appointment.status === 'scheduled' && 
                isFuture(new Date(appointment.appointmentTime))

              return (
                <div
                  key={appointment._id}
                  className="border border-gray-200 rounded-lg p-6 hover:border-primary-300 transition-colors duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="bg-primary-100 p-3 rounded-lg">
                          <Calendar className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {formatAppointmentTime(appointment.appointmentTime)}
                              </h3>
                              <p className="text-gray-600 mt-1">
                                With{' '}
                                <span className="font-medium">
                                  {otherPerson?.name || 'N/A'}
                                </span>
                                {otherPerson?.department && (
                                  <span className="text-gray-500">
                                    {' '}• {otherPerson.department}
                                  </span>
                                )}
                              </p>
                            </div>
                            {getStatusBadge(appointment.status)}
                          </div>

                          {appointment.reason && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                              <p className="text-gray-700">{appointment.reason}</p>
                            </div>
                          )}

                          {appointment.cancellationReason && (
                            <div className="mt-4 p-4 bg-red-50 rounded-lg">
                              <div className="flex items-start space-x-2">
                                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium text-red-800">
                                    Cancellation Reason
                                  </p>
                                  <p className="text-sm text-red-600 mt-1">
                                    {appointment.cancellationReason}
                                  </p>
                                  {appointment.cancelledBy && (
                                    <p className="text-xs text-red-500 mt-1">
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
                          className="btn-danger text-sm px-3 py-1"
                        >
                          Cancel
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
              <p className="text-sm font-medium text-gray-600">Total</p>
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
              <p className="text-sm font-medium text-gray-600">Scheduled</p>
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
              <p className="text-sm font-medium text-gray-600">Completed</p>
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
              <p className="text-sm font-medium text-gray-600">Cancelled</p>
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