import React, { useState, useContext, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import gsap from 'gsap'
import Input from '../components/Input'
import Button from '../components/Button'

export default function Login() {
  const { login } = useContext(AuthContext)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const formRef = useRef()

  useEffect(() => {
    gsap.from(formRef.current, { y: -10, opacity: 0, duration: 0.5 })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed'
      setError(Array.isArray(msg) ? msg.join(' | ') : msg)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div ref={formRef} className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Sign in to your account</h2>
        {error && <div className="bg-red-50 text-red-700 p-2 rounded mb-3">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          <div className="text-right">
            <Button type="submit">Sign in</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
