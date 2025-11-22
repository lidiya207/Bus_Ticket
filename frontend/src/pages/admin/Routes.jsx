import { useState, useEffect } from 'react'
import api from '../../services/api'
import { useTheme } from '../../context/ThemeContext'
import './AdminCommon.css'

const AdminRoutes = () => {
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    distance_km: '',
    estimated_duration_minutes: '',
    base_price: '',
    status: 'active',
  })
  const theme = useTheme()

  useEffect(() => {
    fetchRoutes()
  }, [])

  const fetchRoutes = async () => {
    try {
      const response = await api.get('/routes')
      setRoutes(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch routes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await api.put(`/routes/${editing}`, formData)
      } else {
        await api.post('/routes', formData)
      }
      setShowModal(false)
      setEditing(null)
      setFormData({
        from: '',
        to: '',
        distance_km: '',
        estimated_duration_minutes: '',
        base_price: '',
        status: 'active',
      })
      fetchRoutes()
    } catch (error) {
      alert('Failed to save route')
    }
  }

  const handleEdit = (route) => {
    setEditing(route.id)
    setFormData({
      from: route.from,
      to: route.to,
      distance_km: route.distance_km,
      estimated_duration_minutes: route.estimated_duration_minutes,
      base_price: route.base_price,
      status: route.status,
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this route?')) return
    try {
      await api.delete(`/routes/${id}`)
      fetchRoutes()
    } catch (error) {
      alert('Failed to delete route')
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1 style={{ color: theme.colors.black }}>Manage Routes</h1>
        <button
          onClick={() => {
            setEditing(null)
            setFormData({
              from: '',
              to: '',
              distance_km: '',
              estimated_duration_minutes: '',
              base_price: '',
              status: 'active',
            })
            setShowModal(true)
          }}
          style={{ backgroundColor: theme.colors.brown, color: theme.colors.white }}
        >
          Add Route
        </button>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>From</th>
            <th>To</th>
            <th>Distance (km)</th>
            <th>Duration (min)</th>
            <th>Base Price</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {routes.map((route) => (
            <tr key={route.id}>
              <td>{route.from}</td>
              <td>{route.to}</td>
              <td>{route.distance_km}</td>
              <td>{route.estimated_duration_minutes}</td>
              <td>${route.base_price}</td>
              <td>{route.status}</td>
              <td>
                <button onClick={() => handleEdit(route)}>Edit</button>
                <button onClick={() => handleDelete(route.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Edit Route' : 'Add Route'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>From</label>
                <input
                  type="text"
                  value={formData.from}
                  onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>To</label>
                <input
                  type="text"
                  value={formData.to}
                  onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Distance (km)</label>
                <input
                  type="number"
                  value={formData.distance_km}
                  onChange={(e) => setFormData({ ...formData, distance_km: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.estimated_duration_minutes}
                  onChange={(e) =>
                    setFormData({ ...formData, estimated_duration_minutes: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Base Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.base_price}
                  onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="active">Active</option>
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

export default AdminRoutes

