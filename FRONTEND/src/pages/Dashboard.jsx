// Dashboard Component - Main page users see after logging in
// Shows different menu options based on their role (student or professor)
// Students see: Find Professors & Book, My Appointments
// Professors see: Manage Availability, View Appointments

import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import Hero from '../components/Hero'
import Footer from '../components/Footer'
import { BookOpen, CheckSquare, Clock, Users, Calendar, FileText } from 'lucide-react'

export default function Dashboard() {
  // Get current user info from AuthContext
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

  const studentOptions = [
    {
      title: 'Find Professors & Book',
      description: 'Browse available professors and schedule appointments',
      icon: BookOpen,
      link: '/book-appointment',
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'My Appointments',
      description: 'View and manage all your scheduled appointments',
      icon: Calendar,
      link: '/my-appointments',
      color: 'bg-green-500',
      bgColor: 'bg-green-50'
    }
  ]

  const professorOptions = [
    {
      title: 'Manage Availability',
      description: 'Set your available time slots for student meetings',
      icon: Clock,
      link: '/professor/availability',
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'View Appointments',
      description: 'See all your scheduled student appointments',
      icon: Users,
      link: '/professor/appointments',
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50'
    }
  ]

  const options = user.role === 'student' ? studentOptions : professorOptions

  return (
    <div className="space-y-12">
      {/* Welcome Header */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          Welcome, {user.name}! 👋
        </h1>
        <p className="text-lg text-gray-600">
          {user.role === 'student' 
            ? 'Find professors and schedule your appointments'
            : 'Manage your availability and student appointments'}
        </p>
      </div>

      {/* Main Options Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {options.map((option, index) => (
          <Link 
            key={index}
            to={option.link}
            className="group"
          >
            <div className={`${option.bgColor} rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer border-2 border-transparent hover:border-${option.color.split('-')[1]}-300`}>
              <div className="flex items-start justify-between mb-6">
                <div className={`${option.color} p-4 rounded-xl transition-all duration-300 group-hover:scale-110`}>
                  <option.icon className="h-8 w-8 text-white" />
                </div>
                <span className="text-4xl opacity-10 group-hover:opacity-20 transition-opacity">→</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all">
                {option.title}
              </h3>
              <p className="text-gray-600 group-hover:text-gray-700 transition-colors">
                {option.description}
              </p>
              <div className="mt-6 flex items-center text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                <span>Get Started</span>
                <span className="ml-2 transition-transform group-hover:translate-x-2">→</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Info</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Account Type</p>
            <p className="text-lg font-bold text-gray-900 capitalize">{user.role}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Email</p>
            <p className="text-lg font-bold text-gray-900">{user.email}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Account Status</p>
            <p className="text-lg font-bold text-green-600">Active ✓</p>
          </div>
        </div>
      </div>
    </div>
  )
}
