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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Availability</h1>
          <p className="text-gray-600 mt-2">
            Set your available time slots for student appointments
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingSlot(null)
          }}
          className="btn-primary flex items-center"
          disabled={showForm}
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Time Slot
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card animate-slide-down">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {editingSlot ? 'Edit Time Slot' : 'Add New Time Slot'}
            </h2>
            <button
              onClick={() => {
                setShowForm(false)
                setEditingSlot(null)
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  min={formData.startDate}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingSlot(null)
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex-1"
              >
                {editingSlot ? 'Update Slot' : 'Add Slot'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Availability List */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Your Time Slots</h2>
          <div className="text-sm text-gray-600">
            {availability.length} total slots
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : availability.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Time Slots</h3>
            <p className="text-gray-600 mb-6">Add your available time slots for students to book appointments</p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary inline-flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Your First Slot
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {availability.map((slot) => (
              <div
                key={slot._id}
                className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${
                      slot.isBooked ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      <Clock className={`h-5 w-5 ${
                        slot.isBooked ? 'text-green-600' : 'text-blue-600'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center space-x-3">
                        <p className="font-medium text-gray-900">
                          {formatSlotTime(slot)}
                        </p>
                        {getStatusBadge(slot)}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Duration: {Math.round((new Date(slot.endTime) - new Date(slot.startTime)) / (1000 * 60))} minutes
                      </p>
                      {slot.bookedBy && (
                        <p className="text-sm text-gray-600 mt-1">
                          Booked by: {slot.bookedBy?.name || 'Student'}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!slot.isBooked && (
                      <>
                        <button
                          onClick={() => handleEdit(slot)}
                          className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(slot._id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Delete Confirmation */}
                {deleteConfirm === slot._id && (
                  <div className="mt-4 p-4 bg-red-50 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-red-800 font-medium">
                          Are you sure you want to delete this time slot?
                        </p>
                        <p className="text-sm text-red-600 mt-1">
                          This action cannot be undone.
                        </p>
                        <div className="flex space-x-3 mt-3">
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="text-sm text-gray-600 hover:text-gray-800"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDelete(slot._id)}
                            className="text-sm text-red-600 hover:text-red-800 font-medium"
                          >
                            Delete Slot
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
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available Slots</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {availability.filter(slot => !slot.isBooked).length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Booked Slots</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {availability.filter(slot => slot.isBooked).length}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Slots</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {availability.length}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Check className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

