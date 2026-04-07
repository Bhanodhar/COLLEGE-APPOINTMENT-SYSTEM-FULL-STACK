// ProfessorAppointments Component - Shows all appointments for a professor
// Professors can view student details and cancel appointments

import React, { useEffect, useState, useRef } from 'react'
import { appointmentService } from '../services'
import toast from 'react-hot-toast'

export default function ProfessorAppointments() {
  // State for storing appointments and loading status
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const containerRef = useRef()

  // Load appointments when component first appears (runs once)
  useEffect(() => {
    loadAppointments()
  }, [])

  // Function to fetch appointments from the backend
  const loadAppointments = async () => {
    try {
      const res = await appointmentService.getProfessorAppointments()
      setAppointments(res.data.data || [])
    } catch (err) {
      toast.error('Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  // Function to cancel an appointment
  const handleCancel = async (id) => {
    try {
      await appointmentService.cancel(id, 'Cancelled by professor')
      // Remove the cancelled appointment from the list
      setAppointments(prev => prev.filter(a => a._id !== id))
      toast.success('Appointment cancelled')
    } catch (err) {
      toast.error('Failed to cancel appointment')
    }
  }

  return (
    <div ref={containerRef} className="page-content" style={{ backgroundColor: '#ffffff !important', color: '#000000 !important' }}>
      <h2 className="text-2xl font-bold mb-6 text-gray-900">👥 My Appointments</h2>
      
      {loading ? (
        <div className="text-center py-8 text-gray-600">Loading appointments...</div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-8 text-gray-600 font-medium">No appointments scheduled</div>
      ) : (
        <div className="space-y-4">
          {appointments.map(a => (
            <div key={a._id} className="bg-white p-4 rounded-lg border-2 border-blue-200 flex justify-between items-center hover:shadow-md transition-shadow">
              <div>
                <div className="font-bold text-gray-900">👤 {a.student?.name || 'Unknown'}</div>
                <div className="text-sm text-gray-700">📧 {a.student?.email || 'N/A'}</div>
                <div className="text-sm text-gray-700 mt-2">📅 {new Date(a.appointmentTime).toLocaleString()}</div>
                <div className="text-sm text-gray-700">Status: <span className={`font-bold ${a.status === 'scheduled' ? 'text-green-600' : 'text-red-600'}`}>{a.status}</span></div>
              </div>
              {a.status === 'scheduled' && (
                <button 
                  onClick={() => handleCancel(a._id)} 
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
                >
                  Cancel
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
