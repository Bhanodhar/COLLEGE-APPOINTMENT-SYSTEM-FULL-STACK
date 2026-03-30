import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AnimationProvider } from './contexts/AnimationContext'
import NavBar from './components/NavBar'
import './App.css'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import ProfessorList from './pages/ProfessorList'
import StudentAppointments from './pages/StudentAppointments'
import ProfessorAppointments from './pages/ProfessorAppointments'
import ProfessorAvailability from './pages/ProfessorAvailability'
import MyAppointments from './pages/MyAppointments'
import BookAppointment from './pages/student/BookAppointment'


export default function App() {
  return (
    <AuthProvider>
      <AnimationProvider>
        <div className="min-h-screen bg-white" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
          <NavBar />
          <div className="container mx-auto p-6" style={{ color: '#000000' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />}
              
              <Route path="/professors" element={<ProtectedRoute><ProfessorList /></ProtectedRoute>} />
              <Route path="/my-appointments" element={<ProtectedRoute><StudentAppointments /></ProtectedRoute>} />
              <Route path="/professor/appointments" element={<ProtectedRoute role="professor"><ProfessorAppointments /></ProtectedRoute>} />
              <Route path="/professor/availability" element={<ProtectedRoute role="professor"><ProfessorAvailability /></ProtectedRoute>} />
              {/* <Route path="/my-appointments" element={<ProtectedRoute><MyAppointments /></ProtectedRoute>} /> */}
              <Route path="/book-appointment" element={<ProtectedRoute role="student"><BookAppointment /></ProtectedRoute>} />
            </Routes>
          </div>
        </div>
      </AnimationProvider>
    </AuthProvider>
  )
}
