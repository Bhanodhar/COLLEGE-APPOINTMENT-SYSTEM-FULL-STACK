// ProfessorAvailability Component - Professors set their available time slots
// Students can only book appointments during these times

import React, { useEffect, useState, useRef } from 'react'
import { availabilityService } from '../services'
import toast from 'react-hot-toast'

export default function ProfessorAvailability() {
  // State variables
  const [startTime, setStartTime] = useState('')   // When availability starts
  const [endTime, setEndTime] = useState('')       // When availability ends
  const [slots, setSlots] = useState([])           // List of all availability slots
  const [loading, setLoading] = useState(false)
  const containerRef = useRef()

  // Load slots when component first appears (runs once)
  useEffect(() => {
    loadSlots()
  }, [])

  // Fetch all availability slots from backend
  const loadSlots = async () => {
    try {
      setLoading(true)
      const res = await availabilityService.getMyAvailability()
      setSlots(res.data.data || [])
    } catch (err) {
      toast.error('Failed to load availability')
    } finally {
      setLoading(false)
    }
  }

  // Create a new availability slot
  const handleCreate = async (e) => {
    e.preventDefault()
    if (!startTime || !endTime) {
      toast.error('Please select both start and end times')
      return
    }
    
    try {
      // Send the new availability to backend
      await availabilityService.create({ startTime, endTime })
      toast.success('Availability slot created!')
      // Clear the form inputs
      setStartTime('')
      setEndTime('')
      // Refresh the list to show the new slot
      loadSlots()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create availability')
    }
  }

  // Delete an availability slot
  const handleDelete = async (id) => {
    if (window.confirm('Delete this availability slot?')) {
      try {
        await availabilityService.deleteSlot(id)
        toast.success('Slot deleted')
        loadSlots()
      } catch (err) {
        toast.error('Failed to delete slot')
      }
    }
  }

  return (
    <div ref={containerRef} className="page-content" style={{ backgroundColor: '#ffffff !important', color: '#000000 !important' }}>
      <h2 className="text-2xl font-bold mb-6 text-gray-900">⏰ Manage Your Availability</h2>

      {/* Form to create new availability slot */}
      <form onSubmit={handleCreate} className="bg-white p-4 rounded-lg border-2 border-green-200 space-y-4 mb-6">
        <h3 className="font-bold text-lg text-gray-900">➕ Add New Time Slot</h3>
        
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">📍 Start Time</label>
          <input 
            type="datetime-local" 
            value={startTime} 
            onChange={e => setStartTime(e.target.value)} 
            className="w-full border-2 border-green-200 px-3 py-2 rounded-lg focus:border-green-500"
            required 
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">📍 End Time</label>
          <input 
            type="datetime-local" 
            value={endTime} 
            onChange={e => setEndTime(e.target.value)} 
            className="w-full border-2 border-green-200 px-3 py-2 rounded-lg focus:border-green-500"
            required 
          />
        </div>

        <div className="text-right">
          <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold">
            Create Slot
          </button>
        </div>
      </form>

      {/* List of existing availability slots */}
      <div>
        <h3 className="font-bold text-lg text-gray-900 mb-4">📋 Your Available Slots</h3>
        
        {loading ? (
          <div className="text-center py-8 text-gray-600">Loading slots...</div>
        ) : slots.length === 0 ? (
          <div className="text-center py-8 text-gray-600 font-medium">No availability slots created yet</div>
        ) : (
          <div className="space-y-3">
            {slots.map(s => (
              <div key={s._id} className="bg-white p-4 rounded-lg border-2 border-blue-200 flex justify-between items-center hover:shadow-md transition-shadow">
                <div>
                  <div className="font-bold text-gray-900">📅 {new Date(s.startTime).toLocaleString()}</div>
                  <div className="text-sm text-gray-700">Ends at {new Date(s.endTime).toLocaleTimeString()}</div>
                  {s.isBooked && <div className="text-sm text-red-600 font-semibold mt-1">🔴 Booked by student</div>}
                </div>
                {!s.isBooked && (
                  <button 
                    onClick={() => handleDelete(s._id)} 
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
