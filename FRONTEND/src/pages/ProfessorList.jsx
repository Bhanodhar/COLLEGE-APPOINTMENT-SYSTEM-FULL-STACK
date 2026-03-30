import React, { useEffect, useState, useRef } from 'react'
import api from '../api/client'
import { getProfessorAvailability } from '../api/availability'
import { bookAppointment } from '../api/appointments'
import gsap from 'gsap'

export default function ProfessorList() {
  const [professors, setProfessors] = useState([])
  const [selected, setSelected] = useState(null)
  const [slots, setSlots] = useState([])
  const [message, setMessage] = useState(null)
  const containerRef = useRef()

  useEffect(() => {
    gsap.from(containerRef.current, { opacity: 0, y: 10, duration: 0.6 })
    // fetch professors from backend: users with role professor
    api.get('/auth')
      .then(res => {
        // backend doesn't expose a list route; attempt to fetch via /auth/me only
        // fallback: ask backend to add a professor list if needed. For now assume no public list.
        // We'll simulate by using professor from /auth/me if role professor.
        setProfessors([])
      })
  }, [])

  const viewSlots = async (prof) => {
    setSelected(prof)
    try {
      const res = await getProfessorAvailability(prof._id)
      setSlots(res.data.data)
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to load slots')
    }
  }

  const handleBook = async (availabilityId) => {
    try {
      const res = await bookAppointment({ availabilityId })
      setMessage('Appointment booked')
      // mark slot locally as booked
      setSlots(prev => prev.map(s => s._id === availabilityId ? { ...s, isBooked: true } : s))
    } catch (err) {
      setMessage(err.response?.data?.message || 'Booking failed')
    }
  }

  return (
    <div ref={containerRef} className="page-content" style={{ backgroundColor: '#ffffff !important', color: '#000000 !important', opacity: '1 !important', visibility: 'visible' }}>
      <h2 className="text-xl font-semibold mb-4" style={{ color: '#000000' }}>Find Professors</h2>
      {message && <div className="mb-3 text-sm text-green-700" style={{ color: '#000000', backgroundColor: '#f0fdf4', padding: '8px', borderRadius: '4px' }}>{message}</div>}

      <div className="bg-white p-4 rounded shadow" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
        <p className="text-sm text-gray-600" style={{ color: '#000000' }}>If you need a professors list endpoint, add it to backend. For now you can book via professor profile link when available.</p>
      </div>

      {selected && (
        <div className="mt-6 bg-white p-4 rounded shadow" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
          <h3 className="font-medium" style={{ color: '#000000' }}>Availability for {selected.name}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            {slots.length === 0 && <div className="text-sm text-gray-600" style={{ color: '#000000' }}>No available slots</div>}
            {slots.map(slot => (
              <div key={slot._id} className="p-3 border rounded flex justify-between items-center" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
                <div>
                  <div className="font-medium" style={{ color: '#000000' }}>{new Date(slot.startTime).toLocaleString()}</div>
                  <div className="text-sm text-gray-500" style={{ color: '#000000' }}>Ends: {new Date(slot.endTime).toLocaleTimeString()}</div>
                </div>
                <div>
                  {slot.isBooked ? (
                    <span className="text-sm text-red-500">Booked</span>
                  ) : (
                    <button onClick={() => handleBook(slot._id)} className="px-3 py-1 bg-blue-600 text-white rounded">Book</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
