import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useGSAP } from '../../contexts/AnimationContext'
import { availabilityService } from '../../services/availabilityService'
import toast from 'react-hot-toast'
import { 
  Plus, 
  Clock, 
  Calendar, 
  Trash2, 
  Edit2,
  Check,
  X,
  AlertCircle
} from 'lucide-react'
import { format, addDays, startOfDay, endOfDay } from 'date-fns'

export default function Availability() {
  const { user } = useAuth()
  const { animatePageEnter } = useGSAP()
  const [availability, setAvailability] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingSlot, setEditingSlot] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const formRef = useRef(null)

  const [formData, setFormData] = useState({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    endDate: format(new Date(), 'yyyy-MM-dd'),
    endTime: '10:00',
    recurrence: 'none'
  })

  useEffect(() => {
    fetchAvailability()
    if (formRef.current) {
      animatePageEnter(formRef.current)
    }
  }, [])

  const fetchAvailability = async () => {
    try {
      setLoading(true)
      const { data } = await availabilityService.getMyAvailability()
      setAvailability(data.data || [])
    } catch (error) {
      toast.error('Failed to fetch availability')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`)
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`)
      
      if (endDateTime <= startDateTime) {
        toast.error('End time must be after start time')
        return
      }

      const availabilityData = {
        startTime: startDateTime,
        endTime: endDateTime
      }

      if (editingSlot) {
        // Update existing slot
        // Note: You'll need to implement an update endpoint
        toast.success('Update functionality to be implemented')
      } else {
        // Create new slot
        await availabilityService.create(availabilityData)
        toast.success('Time slot added successfully!')
      }

      // Reset form and refresh data
      setShowForm(false)
      setEditingSlot(null)
      setFormData({
        startDate: format(new Date(), 'yyyy-MM-dd'),
        startTime: '09:00',
        endDate: format(new Date(), 'yyyy-MM-dd'),
        endTime: '10:00',
        recurrence: 'none'
      })
      
      fetchAvailability()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save time slot')
    }
  }

  const handleDelete = async (id) => {
    try {
      await availabilityService.delete(id)
      toast.success('Time slot deleted successfully!')
      setDeleteConfirm(null)
      fetchAvailability()
    } catch (error) {
      toast.error('Failed to delete time slot')
    }
  }

  const handleEdit = (slot) => {
    setEditingSlot(slot)
    setShowForm(true)
    setFormData({
      startDate: format(new Date(slot.startTime), 'yyyy-MM-dd'),
      startTime: format(new Date(slot.startTime), 'HH:mm'),
      endDate: format(new Date(slot.endTime), 'yyyy-MM-dd'),
      endTime: format(new Date(slot.endTime), 'HH:mm'),
      recurrence: 'none'
    })
  }

  const getStatusBadge = (slot) => {
    if (slot.isBooked) {
      return (
        <span className="badge badge-success">
          <Check className="h-3 w-3 mr-1" />
          Booked
        </span>
      )
    }
    return (
      <span className="badge badge-info">
        <Clock className="h-3 w-3 mr-1" />
        Available
      </span>
    )
  }

  const formatSlotTime = (slot) => {
    const start = format(new Date(slot.startTime), 'MMM d, yyyy • h:mm a')
    const end = format(new Date(slot.endTime), 'h:mm a')
    return `${start} - ${end}`
  }

  return (
    <div ref={formRef} className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">⏰ Manage Availability</h1>
          <p className="text-lg text-gray-600">
            Define your availability slots for students to book appointments
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingSlot(null)
          }}
          className="btn-primary flex items-center justify-center rounded-xl font-bold text-lg py-3 px-6 whitespace-nowrap transform hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={showForm}
        >
          <Plus className="h-6 w-6 mr-2" />
          Add Time Slot
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white animate-slide-down">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <span className="bg-blue-100 p-2 rounded-lg mr-3">
                <Calendar className="h-6 w-6 text-blue-600" />
              </span>
              {editingSlot ? '✏️ Edit Time Slot' : '➕ Add New Time Slot'}
            </h2>
            <button
              onClick={() => {
                setShowForm(false)
                setEditingSlot(null)
              }}
              className="text-gray-600 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  📅 Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="input-field border-2 border-blue-100 focus:border-blue-500 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  🕐 Start Time
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="input-field border-2 border-blue-100 focus:border-blue-500 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  📅 End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  min={formData.startDate}
                  className="input-field border-2 border-blue-100 focus:border-blue-500 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  🕐 End Time
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="input-field border-2 border-blue-100 focus:border-blue-500 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingSlot(null)
                }}
                className="flex-1 btn-secondary rounded-xl font-bold text-lg py-3 border-2 border-gray-300 hover:border-gray-400"
              >
                ❌ Cancel
              </button>
              <button
                type="submit"
                className="flex-1 btn-primary rounded-xl font-bold text-lg py-3 transform hover:scale-105 transition-transform"
              >
                {editingSlot ? '💾 Update Slot' : '✅ Add Slot'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Availability List */}
      <div className="card border-2 border-green-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <span className="bg-green-100 p-2 rounded-lg mr-3">
              <Clock className="h-6 w-6 text-green-600" />
            </span>
            Your Time Slots
          </h2>
          <div className="text-sm font-bold text-gray-700 bg-gray-100 px-4 py-2 rounded-lg">
            📊 Total: {availability.length} slots
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your availability...</p>
            </div>
          </div>
        ) : availability.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-b from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-300">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Time Slots Yet</h3>
            <p className="text-gray-600 mb-8">Create your first availability slot to accept student appointments</p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary inline-flex items-center rounded-xl font-bold text-lg py-3 px-6"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Your First Slot
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {availability.map((slot) => (
              <div
                key={slot._id}
                className={`border-2 rounded-xl p-5 transition-all duration-300 ${
                  slot.isBooked 
                    ? 'border-green-500 bg-green-50 hover:bg-green-100' 
                    : 'border-blue-200 bg-blue-50 hover:bg-blue-100'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className={`p-3 rounded-lg ${
                      slot.isBooked ? 'bg-green-500' : 'bg-blue-500'
                    }`}>
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <p className="font-bold text-gray-900 text-lg">
                          {formatSlotTime(slot)}
                        </p>
                        {getStatusBadge(slot)}
                      </div>
                      <p className="text-sm text-gray-700 font-semibold">
                        ⏱️ Duration: {Math.round((new Date(slot.endTime) - new Date(slot.startTime)) / (1000 * 60))} minutes
                      </p>
                      {slot.bookedBy && (
                        <p className="text-sm text-green-700 font-semibold mt-1">
                          👨‍🎓 Booked by: {slot.bookedBy?.name || 'Student'}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 flex-shrink-0">
                    {!slot.isBooked && (
                      <>
                        <button
                          onClick={() => handleEdit(slot)}
                          className="p-3 bg-blue-200 hover:bg-blue-300 text-blue-700 rounded-lg transition-colors transform hover:scale-110"
                          title="Edit"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(slot._id)}
                          className="p-3 bg-red-200 hover:bg-red-300 text-red-700 rounded-lg transition-colors transform hover:scale-110"
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Delete Confirmation */}
                {deleteConfirm === slot._id && (
                  <div className="mt-5 p-4 bg-red-100 rounded-lg border-2 border-red-300">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-red-900 font-bold">
                          ⚠️ Are you sure you want to delete this time slot?
                        </p>
                        <p className="text-sm text-red-700 mt-2">
                          This action cannot be undone.
                        </p>
                        <div className="flex space-x-4 mt-4">
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-4 py-2 bg-white text-red-700 font-bold rounded-lg hover:bg-red-50 border-2 border-red-300"
                          >
                            ❌ Cancel
                          </button>
                          <button
                            onClick={() => handleDelete(slot._id)}
                            className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700"
                          >
                            🗑️ Delete Slot
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white hover:shadow-xl transition-all hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-700">📊 Available Slots</p>
              <p className="text-4xl font-bold text-blue-600 mt-2">
                {availability.filter(slot => !slot.isBooked).length}
              </p>
            </div>
            <div className="bg-blue-500 p-4 rounded-xl shadow-lg">
              <Clock className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>

        <div className="card border-2 border-green-100 bg-gradient-to-br from-green-50 to-white hover:shadow-xl transition-all hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-700">✅ Booked Slots</p>
              <p className="text-4xl font-bold text-green-600 mt-2">
                {availability.filter(slot => slot.isBooked).length}
              </p>
            </div>
            <div className="bg-green-500 p-4 rounded-xl shadow-lg">
              <Calendar className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>

        <div className="card border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-white hover:shadow-xl transition-all hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-700">📈 Total Slots</p>
              <p className="text-4xl font-bold text-purple-600 mt-2">
                {availability.length}
              </p>
            </div>
            <div className="bg-purple-500 p-4 rounded-xl shadow-lg">
              <Check className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

