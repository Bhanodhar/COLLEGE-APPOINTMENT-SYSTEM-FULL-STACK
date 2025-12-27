import { NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  LayoutDashboard, 
  Calendar, 
  Clock, 
  Users,
  BookOpen,
  Settings,
  GraduationCap,
  UserCircle
} from 'lucide-react'
import { useGSAP } from '../../contexts/AnimationContext'
import { useEffect, useRef } from 'react'

const studentNav = [
  { name: 'Dashboard', href: '/student', icon: LayoutDashboard },
  { name: 'Book Appointment', href: '/book-appointment', icon: Calendar },
  { name: 'My Appointments', href: '/my-appointments', icon: Clock },
  { name: 'Professors', href: '/professors', icon: Users },
]

const professorNav = [
  { name: 'Dashboard', href: '/professor', icon: LayoutDashboard },
  { name: 'My Availability', href: '/availability', icon: Clock },
  { name: 'My Appointments', href: '/my-appointments', icon: Calendar },
  { name: 'Students', href: '/students', icon: Users },
]

export default function Sidebar() {
  const { user } = useAuth()
  const { animateStagger } = useGSAP()
  const navRef = useRef(null)

  useEffect(() => {
    if (navRef.current) {
      const links = navRef.current.querySelectorAll('.nav-link')
      animateStagger(links)
    }
  }, [])

  const navItems = user?.role === 'student' ? studentNav : professorNav

  return (
    <aside className="bg-white shadow-lg fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 overflow-y-auto z-40">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="bg-primary-100 p-2 rounded-lg">
            {user?.role === 'student' ? (
              <GraduationCap className="h-6 w-6 text-primary-600" />
            ) : (
              <UserCircle className="h-6 w-6 text-primary-600" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{user?.name}</h3>
            <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>

        <nav ref={navRef} className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `nav-link flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-8 pt-8 border-t">
          <NavLink
            to="/settings"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-all duration-200"
          >
            <Settings className="h-5 w-5" />
            <span className="font-medium">Settings</span>
          </NavLink>
        </div>
      </div>
    </aside>
  )
}