import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useGSAP } from '../../contexts/AnimationContext'
import { appointmentService } from '../../services/appointmentService'
import toast from 'react-hot-toast'
import { 
  Calendar, 
  Clock, 
  UserCheck, 
  AlertCircle,
  CalendarDays,
  Users,
  BookOpen,
  ChevronRight
} from 'lucide-react'
import { format, isToday, isTomorrow } from 'date-fns'

export default function StudentDashboard() {
  const { user } = useAuth()
  const { animateStagger } = useGSAP()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const cardsRef = useRef(null)

  useEffect(() => {
    fetchAppointments()
    if (cardsRef.current) {
      animateStagger(cardsRef.current.children)
    }
  }, [])

  const fetchAppointments = async () => {
    try {
      const { data } = await appointmentService.getStudentAppointments()
      setAppointments(data.data || [])
    } catch (error) {
      toast.error('Failed to fetch appointments')
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
      title: 'Completed',
      value: appointments.filter(apt => apt.status === 'completed').length,
      icon: UserCheck,
      color: 'bg-green-500',
      description: 'Past appointments'
    },
    {
      title: 'Cancelled',
      value: appointments.filter(apt => apt.status === 'cancelled').length,
      icon: AlertCircle,
      color: 'bg-red-500',
      description: 'Cancelled appointments'
    },
    {
      title: 'Total Hours',
      value: appointments.length * 1, // Assuming 1 hour per appointment
      icon: Clock,
      color: 'bg-purple-500',
      description: 'Time spent'
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
          Student Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your appointments and connect with professors
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
                          With <span className="font-semibold">{appointment.professor?.name || 'Professor'}</span>
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {appointment.professor?.department || 'Department not specified'}
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
                <p className="text-gray-600 mb-6">Book your first appointment with a professor</p>
                <Link to="/book-appointment" className="btn-primary inline-flex items-center">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Book Appointment
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="space-y-4">
              <Link
                to="/book-appointment"
                className="flex items-center space-x-4 p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors duration-200 group"
              >
                <div className="bg-primary-100 group-hover:bg-primary-200 p-3 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Book Appointment</h3>
                  <p className="text-sm text-gray-600">Schedule with professors</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Link>

              <Link
                to="/my-appointments"
                className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200 group"
              >
                <div className="bg-blue-100 group-hover:bg-blue-200 p-3 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">My Appointments</h3>
                  <p className="text-sm text-gray-600">View all appointments</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Link>

              <Link
                to="/professors"
                className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200 group"
              >
                <div className="bg-green-100 group-hover:bg-green-200 p-3 rounded-lg">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Browse Professors</h3>
                  <p className="text-sm text-gray-600">Find professors</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}