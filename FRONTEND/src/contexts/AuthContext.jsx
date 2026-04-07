import { createContext, useState, useContext, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'
import api from '../services/api'
import toast from 'react-hot-toast'

// Create the Auth Context
export const AuthContext = createContext(null)

// Custom Hook - use this to access auth anywhere in the app
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

// Auth Provider Component - wrap your app with this
export const AuthProvider = ({ children }) => {
  // State variables
  const [user, setUser] = useState(null)          // Current logged-in user
  const [loading, setLoading] = useState(true)    // Loading state for checking auth

  // When app loads, check if user is already logged in
  useEffect(() => {
    checkAuth()
  }, [])

  // Helper function: Check if user is logged in
  const checkAuth = async () => {
    const token = localStorage.getItem('token')
    
    if (token) {
      try {
        // Decode JWT token
        const decoded = jwtDecode(token)
        const isTokenExpired = decoded.exp * 1000 < Date.now()

        if (isTokenExpired) {
          // Token expired - remove it
          localStorage.removeItem('token')
          setUser(null)
        } else {
          // Token valid - set authorization header
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          // Get user details from backend
          const response = await api.get('/auth/me')
          setUser(response.data.data)
        }
      } catch (error) {
        // Token invalid - remove it
        localStorage.removeItem('token')
        setUser(null)
      }
    }
    
    setLoading(false)
  }

  // Function: Login user
  const login = async (email, password) => {
    try {
      // Send login request
      const response = await api.post('/auth/login', { email, password })
      const { token, data: userData } = response.data
      
      // Save token to localStorage
      localStorage.setItem('token', token)
      
      // Set authorization header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      // Update user state
      setUser(userData)
      
      toast.success('Login successful!')
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Function: Register new user
  const register = async (userData) => {
    try {
      // Send registration request
      const response = await api.post('/auth/register', userData)
      const { token, data: newUser } = response.data
      
      // Save token to localStorage
      localStorage.setItem('token', token)
      
      // Set authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      // Update user state
      setUser(newUser)
      
      toast.success('Registration successful!')
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Function: Logout user
  const logout = () => {
    // Remove token from storage
    localStorage.removeItem('token')
    
    // Remove authorization header
    delete api.defaults.headers.common['Authorization']
    
    // Clear user data
    setUser(null)
    
    toast.success('Logged out successfully')
  }

  // Context value to provide
  const authContextValue = {
    user,           // Current user data
    loading,        // Loading state
    login,          // Login function
    register,       // Register function
    logout,         // Logout function
  }

  // Provide context to all children
  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  )
}