// NavBar Component - Navigation bar showing at top of every page
// Displays user info and role when logged in
// Shows Login/Register links when logged out

import React, { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'

export default function NavBar() {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="backdrop-blur-sm bg-white/70 shadow-sm sticky top-0 z-30">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="font-bold text-lg">College Appointment</Link>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 bg-blue-100 text-blue-900 border-2 border-blue-500 rounded-full font-bold text-sm">
                  👤 {user.name}
                </span>
                <span className={`px-3 py-1 border-2 rounded-full font-bold text-sm ${
                  user.role === 'student' 
                    ? 'bg-green-100 text-green-900 border-green-500' 
                    : 'bg-purple-100 text-purple-900 border-purple-500'
                }`}>
                  {user.role === 'student' ? '👨‍🎓' : '👨‍🏫'} {user.role.toUpperCase()}
                </span>
              </div>
              <button onClick={handleLogout} className="px-3 py-1 bg-red-500 text-white rounded font-semibold hover:bg-red-600">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-3 py-1 bg-blue-600 text-white rounded">Login</Link>
              <Link to="/register" className="px-3 py-1 border rounded">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
