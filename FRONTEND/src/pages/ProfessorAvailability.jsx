import React, { useEffect, useState, useRef } from 'react'
import { createAvailability, getMyAvailability, deleteAvailability } from '../api/availability'
import gsap from 'gsap'

export default function ProfessorAvailability() {
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [slots, setSlots] = useState([])
  const [message, setMessage] = useState(null)
  const containerRef = useRef()

  useEffect(() => {
    gsap.from(containerRef.current, { opacity: 0, y: 8, duration: 0.5 })
    load()
  }, [])

  const load = () => {
    getMyAvailability().then(res => setSlots(res.data.data)).catch(() => {})
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await createAvailability({ startTime, endTime })
      setMessage('Availability created')
      setStartTime('')
      setEndTime('')
      load()
    } catch (err) {
      setMessage(err.response?.data?.message || 'Create failed')
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteAvailability(id)
      setMessage('Deleted')
      load()
    } catch (err) {
      setMessage(err.response?.data?.message || 'Delete failed')
    }
  }

  return (
    <div ref={containerRef} className="page-content" style={{ backgroundColor: '#ffffff !important', color: '#000000 !important', opacity: '1 !important', visibility: 'visible' }}>
      <h2 className="text-xl font-semibold mb-4 text-gray-900" style={{ color: '#000000' }}>Manage Availability</h2>
      {message && <div className="mb-3 text-sm text-green-700" style={{ color: '#000000', backgroundColor: '#f0fdf4', padding: '8px', borderRadius: '4px' }}>{message}</div>}

      <form onSubmit={handleCreate} className="bg-white p-4 rounded shadow space-y-3" style={{ color: '#000000' }}>
        <div>
          <label className="block text-sm text-gray-700 font-medium" style={{ color: '#000000' }}>Start Time</label>
          <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} className="mt-1 w-full border px-3 py-2 rounded" required style={{ color: '#000000', backgroundColor: '#ffffff' }} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 font-medium" style={{ color: '#000000' }}>End Time</label>
          <input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} className="mt-1 w-full border px-3 py-2 rounded" required style={{ color: '#000000', backgroundColor: '#ffffff' }} />
        </div>
        <div className="text-right">
          <button className="px-3 py-1 bg-green-600 text-white rounded">Create</button>
        </div>
      </form>

      <div className="mt-6 space-y-3">
        {slots.length === 0 && <div className="text-sm text-gray-700 font-medium" style={{ color: '#000000' }}>No availability yet.</div>}
        {slots.map(s => (
          <div key={s._id} className="bg-white p-3 rounded shadow flex justify-between items-center" style={{ color: '#000000' }}>
            <div>
              <div className="font-medium text-gray-900" style={{ color: '#000000' }}>{new Date(s.startTime).toLocaleString()}</div>
              <div className="text-sm text-gray-700" style={{ color: '#000000' }}>Ends {new Date(s.endTime).toLocaleTimeString()}</div>
            </div>
            <div>
              {!s.isBooked && <button onClick={() => handleDelete(s._id)} className="px-3 py-1 bg-red-500 text-white rounded">Delete</button>}
              {s.isBooked && <span className="text-sm text-red-600">Booked</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
