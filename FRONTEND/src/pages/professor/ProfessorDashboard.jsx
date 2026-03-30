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
      <div className="space-y-3">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          👨‍🏫 Professor Dashboard
        </h1>
        <p className="text-lg text-gray-700 font-medium">
          Manage your appointments and availability slots
        </p>
      </div>

      {/* Stats Grid */}
      <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card border-2 border-gray-200 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-700">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <p className="text-sm text-gray-700 mt-1">{stat.description}</p>
              </div>
              <div className={`${stat.color} p-4 rounded-xl shadow-lg transform hover:scale-110 transition-transform`}>
                <stat.icon className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Upcoming Appointments */}
        <div className="lg:col-span-2 space-y-8">
          <div className="card border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="bg-blue-100 p-2 rounded-lg mr-3">
                  <CalendarDays className="h-6 w-6 text-blue-600" />
                </span>
                Upcoming Appointments
              </h2>
              <Link 
                to="/my-appointments" 
                className="text-blue-600 hover:text-blue-700 text-sm font-bold flex items-center bg-blue-50 px-3 py-2 rounded-lg transition-colors"
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
                    className="border-l-4 border-l-blue-500 bg-blue-50 rounded-xl p-5 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-3">
                          <Clock className="h-5 w-5 text-blue-600" />
                          <span className="font-bold text-gray-900">
                            {getAppointmentDate(appointment.appointmentTime)} • {getAppointmentTime(appointment.appointmentTime)}
                          </span>
                        </div>
                        <p className="text-gray-900 font-bold text-lg">
                          👨‍🎓 {appointment.student?.name || 'Student'}
                        </p>
                        <p className="text-sm text-gray-700 mt-2">
                          Student ID: {appointment.student?.studentId || 'Not provided'}
                        </p>
                      </div>
                      <span className="badge badge-success flex-shrink-0">Scheduled</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
                <Calendar className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">No Upcoming Appointments</h3>
                <p className="text-gray-700 font-medium">Check back later for student meetings</p>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="card border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-white">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="bg-purple-100 p-2 rounded-lg mr-3">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </span>
              Recent Activity
            </h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-5 bg-green-50 rounded-xl border-l-4 border-l-green-500">
                <div className="bg-green-100 p-3 rounded-lg flex-shrink-0">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">system Ready</p>
                  <p className="text-sm text-gray-600">Your appointment system is configured and active</p>
                </div>
                <span className="text-xs font-bold text-gray-500">Now</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions & Available Slots */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <div className="card border-2 border-orange-100 bg-gradient-to-br from-orange-50 to-white">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="bg-orange-100 p-2 rounded-lg mr-3">
                <Plus className="h-5 w-5 text-orange-600" />
              </span>
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Link
                to="/professor/availability"
                className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl hover:shadow-lg transition-all transform hover:scale-105 group text-white font-bold"
              >
                <Plus className="h-5 w-5" />
                <span>Add Availability</span>
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Link>

              <Link
                to="/professor/availability"
                className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-xl hover:shadow-lg transition-all transform hover:scale-105 text-white font-bold"
              >
                <Clock className="h-5 w-5" />
                <span>Manage Availability</span>
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Link>

              <Link
                to="/my-appointments"
                className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl hover:shadow-lg transition-all transform hover:scale-105 text-white font-bold"
              >
                <Calendar className="h-5 w-5" />
                <span>View Appointments</span>
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Link>
            </div>
          </div>

          {/* Available Slots */}
          <div className="card border-2 border-green-100 bg-gradient-to-br from-green-50 to-white">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <span className="bg-green-100 p-2 rounded-lg mr-3">
                  <Clock className="h-5 w-5 text-green-600" />
                </span>
                Available Slots
              </h2>
              <span className="badge badge-success font-bold text-lg px-4 py-2">
                {getAvailableSlots().length}
              </span>
            </div>
            
            {getAvailableSlots().length > 0 ? (
              <div className="space-y-3">
                {getAvailableSlots().slice(0, 3).map((slot) => (
                  <div key={slot._id} className="border-2 border-green-200 rounded-lg p-4 hover:bg-green-100 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-900">
                          📅 {format(new Date(slot.startTime), 'MMM d, yyyy')}
                        </p>
                        <p className="text-sm text-gray-700 mt-1 font-semibold">
                          ⏰ {format(new Date(slot.startTime), 'h:mm a')} - {format(new Date(slot.endTime), 'h:mm a')}
                        </p>
                      </div>
                      <Clock className="h-6 w-6 text-green-600 flex-shrink-0" />
                    </div>
                  </div>
                ))}
                <div className="mt-4 pt-4 border-t-2 border-green-200">
                  <Link 
                    to="/professor/availability" 
                    className="text-center block w-full py-2 text-green-600 font-bold hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    View All Available Slots →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-green-300">
                <AlertCircle className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-700 font-semibold mb-4">No Available Slots</p>
                <Link 
                  to="/professor/availability" 
                  className="inline-block bg-green-500 text-white font-bold px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Add Availability Now
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}