import { useState, useEffect } from 'react'
import api from '../../services/api'
import { useTheme } from '../../context/ThemeContext'
import './AdminCommon.css'

const AdminSchedules = () => {
  const [schedules, setSchedules] = useState([])
  const [buses, setBuses] = useState([])
  const [routes, setRoutes] = useState([])
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [formData, setFormData] = useState({
    bus_id: '',
    travel_route_id: '',
    driver_id: '',
    departure_time: '',
    arrival_time: '',
    price: '',
    status: 'scheduled',
  })
  const theme = useTheme()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [schedulesRes, busesRes, routesRes, driversRes] = await Promise.all([
        api.get('/schedules'),
        api.get('/buses'),
        api.get('/routes'),
        api.get('/drivers'),
      ])
      setSchedules(schedulesRes.data.data || [])
      setBuses(busesRes.data.data || [])
      setRoutes(routesRes.data.data || [])
      setDrivers(driversRes.data.data || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await api.put(`/schedules/${editing}`, formData)
      } else {
        await api.post('/schedules', formData)
      }
      setShowModal(false)
      setEditing(null)
      resetForm()
      fetchData()
    } catch (error) {
      alert('Failed to save schedule')
    }
  }

  const resetForm = () => {
    setFormData({
      bus_id: '',
      travel_route_id: '',
      driver_id: '',
      departure_time: '',
      arrival_time: '',
      price: '',
      status: 'scheduled',
    })
  }

  const handleEdit = (schedule) => {
    setEditing(schedule.id)
    setFormData({
      bus_id: schedule.bus_id,
      travel_route_id: schedule.travel_route_id,
      driver_id: schedule.driver_id,
      departure_time: schedule.departure_time?.split('T')[0] + 'T' + schedule.departure_time?.split('T')[1]?.slice(0, 5),
      arrival_time: schedule.arrival_time?.split('T')[0] + 'T' + schedule.arrival_time?.split('T')[1]?.slice(0, 5),
      price: schedule.price,
      status: schedule.status,
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return
    try {
      await api.delete(`/schedules/${id}`)
      fetchData()
    } catch (error) {
      alert('Failed to delete schedule')
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1 style={{ color: theme.colors.black }}>Manage Schedules</h1>
        <button
          onClick={() => {
            setEditing(null)
            resetForm()
            setShowModal(true)
          }}
          style={{ backgroundColor: theme.colors.brown, color: theme.colors.white }}
        >
          Add Schedule
        </button>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Route</th>
            <th>Bus</th>
            <th>Driver</th>
            <th>Departure</th>
            <th>Arrival</th>
            <th>Price</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((schedule) => (
            <tr key={schedule.id}>
              <td>
                {schedule.travel_route?.from} → {schedule.travel_route?.to}
              </td>
              <td>{schedule.bus?.name}</td>
              <td>
                {schedule.driver?.first_name} {schedule.driver?.last_name}
              </td>
              <td>{new Date(schedule.departure_time).toLocaleString()}</td>
              <td>{new Date(schedule.arrival_time).toLocaleString()}</td>
              <td>${schedule.price}</td>
              <td>{schedule.status}</td>
              <td>
                <button onClick={() => handleEdit(schedule)}>Edit</button>
                <button onClick={() => handleDelete(schedule.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Edit Schedule' : 'Add Schedule'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Route</label>
                <select
                  value={formData.travel_route_id}
                  onChange={(e) => setFormData({ ...formData, travel_route_id: e.target.value })}
                  required
                >
                  <option value="">Select Route</option>
                  {routes.map((route) => (
                    <option key={route.id} value={route.id}>
                      {route.from} → {route.to}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Bus</label>
                <select
                  value={formData.bus_id}
                  onChange={(e) => setFormData({ ...formData, bus_id: e.target.value })}
                  required
                >
                  <option value="">Select Bus</option>
                  {buses.map((bus) => (
                    <option key={bus.id} value={bus.id}>
                      {bus.name} ({bus.plate_number})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Driver</label>
                <select
                  value={formData.driver_id}
                  onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
                  required
                >
                  <option value="">Select Driver</option>
                  {drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.first_name} {driver.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Departure Time</label>
                <input
                  type="datetime-local"
                  value={formData.departure_time}
                  onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Arrival Time</label>
                <input
                  type="datetime-local"
                  value={formData.arrival_time}
                  onChange={(e) => setFormData({ ...formData, arrival_time: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="boarding">Boarding</option>
                  <option value="departed">Departed</option>
                  <option value="arrived">Arrived</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="submit" style={{ backgroundColor: theme.colors.brown, color: theme.colors.white }}>
                  Save
                </button>
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminSchedules

