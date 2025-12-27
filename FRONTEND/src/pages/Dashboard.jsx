import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import Hero from '../components/Hero'
import Footer from '../components/Footer'

export default function Dashboard() {
  const { user } = useContext(AuthContext)

  if (!user) {
    return (
      <>
        <Hero />
        <div className="container mx-auto px-6">
          <div className="mt-6 text-center text-slate-600">Explore the system, sign up as a student or professor and start managing appointments.</div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold">Dashboard</h2>
      <div className="mt-4 space-y-3">
        {user.role === 'student' && (
          <div className="bg-white p-4 rounded shadow space-y-2">
            <Link to="/professors" className="block text-blue-600">Find Professors & Book</Link>
            <Link to="/appointments" className="block text-blue-600">My Appointments</Link>
          </div>
        )}

        {user.role === 'professor' && (
          <div className="bg-white p-4 rounded shadow space-y-2">
            <Link to="/professor/availability" className="block text-blue-600">Manage Availability</Link>
            <Link to="/professor/appointments" className="block text-blue-600">View Appointments</Link>
          </div>
        )}
      </div>
    </div>
  )
}
