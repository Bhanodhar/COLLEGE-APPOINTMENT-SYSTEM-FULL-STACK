import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// This component protects routes - only logged-in users can access
export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()

  // While loading, show nothing
  if (loading) {
    return null
  }

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // If route requires specific role (professor), check it
  if (role && user.role !== role) {
    // User is logged in but doesn't have the required role
    return <Navigate to="/" replace />
  }

  // User is logged in and authorized, show the page
  return children
}
