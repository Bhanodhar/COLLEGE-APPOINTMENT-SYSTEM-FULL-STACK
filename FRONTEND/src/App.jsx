import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import NavBar from './components/NavBar'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import ProfessorList from './pages/ProfessorList'
import StudentAppointments from './pages/StudentAppointments'
import ProfessorAppointments from './pages/ProfessorAppointments'
import ProfessorAvailability from './pages/ProfessorAvailability'

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-50 text-gray-900">
        <NavBar />
        <div className="container mx-auto p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/professors" element={<ProtectedRoute><ProfessorList /></ProtectedRoute>} />
            <Route path="/appointments" element={<ProtectedRoute><StudentAppointments /></ProtectedRoute>} />
            <Route path="/professor/appointments" element={<ProtectedRoute role="professor"><ProfessorAppointments /></ProtectedRoute>} />
            <Route path="/professor/availability" element={<ProtectedRoute role="professor"><ProfessorAvailability /></ProtectedRoute>} />
          </Routes>
        </div>
      </div>
    </AuthProvider>
  )
}
