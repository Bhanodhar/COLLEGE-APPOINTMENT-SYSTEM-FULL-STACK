import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useGSAP } from '../../contexts/AnimationContext'
import { appointmentService, availabilityService } from '../../services'
import toast from 'react-hot-toast'
import { 
  Calendar, 
  Clock, 
  Users, 
  TrendingUp,
  CalendarDays,
  AlertCircle,
  UserCheck,
  ChevronRight,
  Plus
} from 'lucide-react'
import { format, isToday, isTomorrow } from 'date-fns'

export default function ProfessorDashboard() {
  const { user } = useAuth()
  const { animateStagger } = useGSAP()
  const [appointments, setAppointments] = useState([])
  const [availability, setAvailability] = useState([])
  const [loading, setLoading] = useState(true)
  const cardsRef = useRef(null)

  useEffect(() => {
    fetchData()
    if (cardsRef.current) {
      animateStagger(cardsRef.current.children)
    }
  }, [])

  const fetchData = async () => {
    try {
      const [appointmentsRes, availabilityRes] = await Promise.all([
        appointmentService.getProfessorAppointments(),
        availabilityService.getMyAvailability()
      ])
      setAppointments(appointmentsRes.data.data || [])
      setAvailability(availabilityRes.data.data || [])
    } catch (error) {
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const getUpcomingAppointments = () => {
    return appointments.filter(apt => 
      apt.status === 'scheduled' && 
      new Date(apt.appointmentTime) > new Date()
    ).slice(0, 3)
  }

  const getAvailableSlots = () => {
    return availability.filter(slot => !slot.isBooked)
  }

  const getAppointmentDate = (date) => {
    const appointmentDate = new Date(date)
    if (isToday(appointmentDate)) return 'Today'
    if (isTomorrow(appointmentDate)) return 'Tomorrow'
    return format(appointmentDate, 'MMM d, yyyy')
  }

  const getAppointmentTime = (date) => {
    return format(new Date(date), 'h:mm a')
  }

  const stats = [
    {
      title: 'Upcoming Appointments',
      value: appointments.filter(apt => apt.status === 'scheduled').length,
      icon: Calendar,
      color: 'bg-blue-500',
      description: 'Scheduled meetings'
    },
    {
      title: 'Available Slots',
      value: getAvailableSlots().length,
      icon: Clock,
      color: 'bg-green-500',
      description: 'Open time slots'
    },
    {
      title: 'Students',
      value: new Set(appointments.map(apt => apt.student?._id)).size,
      icon: Users,
      color: 'bg-purple-500',
      description: 'Unique students'
    },
    {
      title: 'Completion Rate',
      value: '100%',
      icon: TrendingUp,
      color: 'bg-orange-500',
      description: 'Appointments completed'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Professor Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your appointments and availability
        </p>
      </div>

      {/* Stats Grid */}
      <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.description}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Upcoming Appointments */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Upcoming Appointments</h2>
              <Link 
                to="/my-appointments" 
                className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
              >
                View all
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            {getUpcomingAppointments().length > 0 ? (
              <div className="space-y-4">
                {getUpcomingAppointments().map((appointment, index) => (
                  <div 
                    key={appointment._id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <CalendarDays className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {getAppointmentDate(appointment.appointmentTime)}
                          </span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-600">{getAppointmentTime(appointment.appointmentTime)}</span>
                        </div>
                        <p className="text-gray-700 mt-2">
                          With <span className="font-semibold">{appointment.student?.name || 'Student'}</span>
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Student ID: {appointment.student?.studentId || 'Not provided'}
                        </p>
                      </div>
                      <span className="badge badge-success">Scheduled</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming appointments</h3>
                <p className="text-gray-600">You don't have any scheduled appointments yet</p>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="card mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <UserCheck className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">No recent activity</p>
                  <p className="text-sm text-gray-500">Your activity will appear here</p>
                </div>
                <span className="text-sm text-gray-500">Just now</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions & Available Slots */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="space-y-4">
              <Link
                to="/availability"
                className="flex items-center space-x-4 p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors duration-200 group"
              >
                <div className="bg-primary-100 group-hover:bg-primary-200 p-3 rounded-lg">
                  <Plus className="h-5 w-5 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Add Availability</h3>
                  <p className="text-sm text-gray-600">Create new time slots</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Link>

              <Link
                to="/availability"
                className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200 group"
              >
                <div className="bg-green-100 group-hover:bg-green-200 p-3 rounded-lg">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Manage Availability</h3>
                  <p className="text-sm text-gray-600">View all time slots</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Link>

              <Link
                to="/my-appointments"
                className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200 group"
              >
                <div className="bg-blue-100 group-hover:bg-blue-200 p-3 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">View Appointments</h3>
                  <p className="text-sm text-gray-600">All scheduled meetings</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Link>
            </div>
          </div>

          {/* Available Slots */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Available Slots</h2>
              <span className="badge badge-info">
                {getAvailableSlots().length} available
              </span>
            </div>
            
            {getAvailableSlots().length > 0 ? (
              <div className="space-y-3">
                {getAvailableSlots().slice(0, 3).map((slot) => (
                  <div key={slot._id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {format(new Date(slot.startTime), 'MMM d')}
                        </p>
                        <p className="text-sm text-gray-600">
                          {format(new Date(slot.startTime), 'h:mm a')} - {format(new Date(slot.endTime), 'h:mm a')}
                        </p>
                      </div>
                      <Clock className="h-5 w-5 text-green-500" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <AlertCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-600">No available slots</p>
                <Link 
                  to="/availability" 
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2 inline-block"
                >
                  Add availability
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}