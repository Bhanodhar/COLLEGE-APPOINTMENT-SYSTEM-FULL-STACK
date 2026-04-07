import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import NavBar from './components/NavBar'
import './App.css'

// Pages
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ProfessorList from './pages/ProfessorList'
import MyAppointments from './pages/MyAppointments'
import ProfessorAppointments from './pages/ProfessorAppointments'
import ProfessorAvailability from './pages/ProfessorAvailability'
import BookAppointment from './pages/student/BookAppointment'

// Components
import ProtectedRoute from './components/ProtectedRoute'

// Main App Component
export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-white">
        {/* Navigation Bar - shows on all pages */}
        <NavBar />
        
        {/* Main Content Area */}
        <div className="container mx-auto p-6">
          <Routes>
            {/* Public Routes - anyone can access */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Private Student Routes */}
            <Route path="/professors" element={<ProtectedRoute><ProfessorList /></ProtectedRoute>} />
            <Route path="/book-appointment" element={<ProtectedRoute><BookAppointment /></ProtectedRoute>} />
            <Route path="/my-appointments" element={<ProtectedRoute><MyAppointments /></ProtectedRoute>} />

            {/* Private Professor Routes */}
            <Route path="/professor/appointments" element={<ProtectedRoute role="professor"><ProfessorAppointments /></ProtectedRoute>} />
            <Route path="/professor/availability" element={<ProtectedRoute role="professor"><ProfessorAvailability /></ProtectedRoute>} />
          </Routes>
        </div>
      </div>
    </AuthProvider>
  )
}
