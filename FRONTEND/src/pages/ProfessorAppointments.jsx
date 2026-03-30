import React, { useEffect, useState, useRef } from 'react'
import { getProfessorAppointments, cancelAppointment } from '../api/appointments'
import gsap from 'gsap'

export default function ProfessorAppointments() {
  const [appointments, setAppointments] = useState([])
  const containerRef = useRef()

  useEffect(() => {
    gsap.from(containerRef.current, { opacity: 0, y: 8, duration: 0.5 })
    getProfessorAppointments().then(res => setAppointments(res.data.data)).catch(() => {})
  }, [])

  const handleCancel = async (id) => {
    try {
      const res = await cancelAppointment(id, 'Cancelled by professor')
      setAppointments(prev => prev.map(a => a._id === id ? res.data.data : a))
    } catch (err) {
      // ignore
    }
  }

  return (
    <div ref={containerRef} className="page-content" style={{ backgroundColor: '#ffffff !important', color: '#000000 !important', opacity: '1 !important', visibility: 'visible' }}>
      <h2 className="text-xl font-semibold mb-4 text-gray-900" style={{ color: '#000000' }}>Professor - Appointments</h2>
      <div className="space-y-3">
        {appointments.length === 0 && <div className="text-sm text-gray-700 font-medium">No appointments found</div>}
        {appointments.map(a => (
          <div key={a._id} className="bg-white p-4 rounded shadow flex justify-between">
            <div>
              <div className="font-medium text-gray-900">Student: {a.student?.name || 'N/A'}</div>
              <div className="text-sm text-gray-700">When: {new Date(a.appointmentTime).toLocaleString()}</div>
              <div className="text-sm text-gray-700">Status: {a.status}</div>
            </div>
            {a.status === 'scheduled' && (
              <button onClick={() => handleCancel(a._id)} className="px-3 py-1 bg-red-600 text-white rounded">Cancel</button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
