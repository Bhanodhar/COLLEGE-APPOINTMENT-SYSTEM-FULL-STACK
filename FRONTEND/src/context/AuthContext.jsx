import React, { createContext, useState, useEffect } from 'react'
import api, { setAuthToken } from '../api/client'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setAuthToken(token)
      // fetch current user
      api.get('/auth/me')
        .then(res => setUser(res.data.data))
        .catch(() => {
          localStorage.removeItem('token')
          setAuthToken(null)
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const token = res.data.token
    localStorage.setItem('token', token)
    setAuthToken(token)
    setUser(res.data.data)
    return res
  }

  const register = async (payload) => {
    const res = await api.post('/auth/register', payload)
    const token = res.data.token
    localStorage.setItem('token', token)
    setAuthToken(token)
    setUser(res.data.data)
    return res
  }

  const logout = () => {
    localStorage.removeItem('token')
    setAuthToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
