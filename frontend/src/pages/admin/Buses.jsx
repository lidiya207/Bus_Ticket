import { useState, useEffect } from 'react'
import api from '../../services/api'
import { useTheme } from '../../context/ThemeContext'
import './AdminCommon.css'

const AdminBuses = () => {
  const [buses, setBuses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    plate_number: '',
    capacity: '',
    bus_type: 'standard',
    status: 'active',
  })
  const theme = useTheme()

  useEffect(() => {
    fetchBuses()
  }, [])

  const fetchBuses = async () => {
    try {
      const response = await api.get('/buses')
      setBuses(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch buses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await api.put(`/buses/${editing}`, formData)
      } else {
        await api.post('/buses', formData)
      }
      setShowModal(false)
      setEditing(null)
      setFormData({ name: '', plate_number: '', capacity: '', bus_type: 'standard', status: 'active' })
      fetchBuses()
    } catch (error) {
      alert('Failed to save bus')
    }
  }

  const handleEdit = (bus) => {
    setEditing(bus.id)
    setFormData({
      name: bus.name,
      plate_number: bus.plate_number,
      capacity: bus.capacity,
      bus_type: bus.bus_type,
      status: bus.status,
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this bus?')) return
    try {
      await api.delete(`/buses/${id}`)
      fetchBuses()
    } catch (error) {
      alert('Failed to delete bus')
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1 style={{ color: theme.colors.black }}>Manage Buses</h1>
        <button
          onClick={() => {
            setEditing(null)
            setFormData({ name: '', plate_number: '', capacity: '', bus_type: 'standard', status: 'active' })
            setShowModal(true)
          }}
          style={{ backgroundColor: theme.colors.brown, color: theme.colors.white }}
        >
          Add Bus
        </button>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Plate Number</th>
            <th>Capacity</th>
            <th>Type</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {buses.map((bus) => (
            <tr key={bus.id}>
              <td>{bus.name}</td>
              <td>{bus.plate_number}</td>
              <td>{bus.capacity}</td>
              <td>{bus.bus_type}</td>
              <td>{bus.status}</td>
              <td>
                <button onClick={() => handleEdit(bus)}>Edit</button>
                <button onClick={() => handleDelete(bus.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Edit Bus' : 'Add Bus'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Plate Number</label>
                <input
                  type="text"
                  value={formData.plate_number}
                  onChange={(e) => setFormData({ ...formData, plate_number: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Capacity</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select
                  value={formData.bus_type}
                  onChange={(e) => setFormData({ ...formData, bus_type: e.target.value })}
                >
                  <option value="standard">Standard</option>
                  <option value="luxury">Luxury</option>
                  <option value="sleeper">Sleeper</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="inactive">Inactive</option>
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

export default AdminBuses

