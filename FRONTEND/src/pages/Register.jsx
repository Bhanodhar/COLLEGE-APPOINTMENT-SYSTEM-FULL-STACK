import React, { useState, useContext, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import gsap from 'gsap'
import Input from '../components/Input'
import Button from '../components/Button'

export default function Register() {
  const { register } = useContext(AuthContext)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [studentId, setStudentId] = useState('')
  const [department, setDepartment] = useState('')
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
      const payload = { name, email, password, role }
      if (role === 'student') payload.studentId = studentId
      if (role === 'professor') payload.department = department
      await register(payload)
      navigate('/')
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed'
      setError(Array.isArray(msg) ? msg.join(' | ') : msg)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div ref={formRef} className="w-full max-w-lg bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Create an account</h2>
        {error && <div className="bg-red-50 text-red-700 p-2 rounded mb-3">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full name" value={name} onChange={e => setName(e.target.value)} required />
          <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />

          <div>
            <label className="block text-sm font-medium text-slate-700">Role</label>
            <select value={role} onChange={e => setRole(e.target.value)} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2">
              <option value="student">Student</option>
              <option value="professor">Professor</option>
            </select>
          </div>

          {role === 'student' && (
            <Input label="Student ID" value={studentId} onChange={e => setStudentId(e.target.value)} required />
          )}

          {role === 'professor' && (
            <Input label="Department" value={department} onChange={e => setDepartment(e.target.value)} required />
          )}

          <div className="text-right">
            <Button type="submit">Create account</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
