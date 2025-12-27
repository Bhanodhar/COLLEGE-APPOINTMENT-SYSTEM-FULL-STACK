import React, { useEffect, useState, useRef } from 'react'
import { getStudentAppointments } from '../api/appointments'
import gsap from 'gsap'

export default function StudentAppointments() {
  const [appointments, setAppointments] = useState([])
  const containerRef = useRef()

  useEffect(() => {
    gsap.from(containerRef.current, { opacity: 0, y: 8, duration: 0.5 })
    getStudentAppointments().then(res => setAppointments(res.data.data)).catch(() => {})
  }, [])

  return (
    <div ref={containerRef}>
      <h2 className="text-xl font-semibold mb-4">My Appointments</h2>
      <div className="space-y-3">
        {appointments.length === 0 && <div className="text-sm text-gray-600">No appointments found</div>}
        {appointments.map(a => (
          <div key={a._id} className="bg-white p-4 rounded shadow flex justify-between">
            <div>
              <div className="font-medium">With: {a.professor?.name || 'N/A'}</div>
              <div className="text-sm text-gray-600">When: {new Date(a.appointmentTime).toLocaleString()}</div>
              <div className="text-sm text-gray-600">Status: {a.status}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
