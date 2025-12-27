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
    <div ref={containerRef}>
      <h2 className="text-xl font-semibold mb-4">Manage Availability</h2>
      {message && <div className="mb-3 text-sm text-green-700">{message}</div>}

      <form onSubmit={handleCreate} className="bg-white p-4 rounded shadow space-y-3">
        <div>
          <label className="block text-sm">Start Time</label>
          <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} className="mt-1 w-full border px-3 py-2 rounded" required />
        </div>
        <div>
          <label className="block text-sm">End Time</label>
          <input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} className="mt-1 w-full border px-3 py-2 rounded" required />
        </div>
        <div className="text-right">
          <button className="px-3 py-1 bg-green-600 text-white rounded">Create</button>
        </div>
      </form>

      <div className="mt-6 space-y-3">
        {slots.length === 0 && <div className="text-sm text-gray-600">No availability yet.</div>}
        {slots.map(s => (
          <div key={s._id} className="bg-white p-3 rounded shadow flex justify-between items-center">
            <div>
              <div className="font-medium">{new Date(s.startTime).toLocaleString()}</div>
              <div className="text-sm text-gray-500">Ends {new Date(s.endTime).toLocaleTimeString()}</div>
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
