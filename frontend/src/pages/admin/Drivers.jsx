import { useState, useEffect } from 'react'
import api from '../../services/api'
import { useTheme } from '../../context/ThemeContext'
import './AdminCommon.css'

const AdminDrivers = () => {
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    license_number: '',
    experience_years: '',
    status: 'active',
  })
  const theme = useTheme()

  useEffect(() => {
    fetchDrivers()
  }, [])

  const fetchDrivers = async () => {
    try {
      const response = await api.get('/drivers')
      setDrivers(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch drivers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await api.put(`/drivers/${editing}`, formData)
      } else {
        await api.post('/drivers', formData)
      }
      setShowModal(false)
      setEditing(null)
      setFormData({
        first_name: '',
        last_name: '',
        phone: '',
        license_number: '',
        experience_years: '',
        status: 'active',
      })
      fetchDrivers()
    } catch (error) {
      alert('Failed to save driver')
    }
  }

  const handleEdit = (driver) => {
    setEditing(driver.id)
    setFormData({
      first_name: driver.first_name,
      last_name: driver.last_name,
      phone: driver.phone,
      license_number: driver.license_number,
      experience_years: driver.experience_years || '',
      status: driver.status,
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this driver?')) return
    try {
      await api.delete(`/drivers/${id}`)
      fetchDrivers()
    } catch (error) {
      alert('Failed to delete driver')
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1 style={{ color: theme.colors.black }}>Manage Drivers</h1>
        <button
          onClick={() => {
            setEditing(null)
            setFormData({
              first_name: '',
              last_name: '',
              phone: '',
              license_number: '',
              experience_years: '',
              status: 'active',
            })
            setShowModal(true)
          }}
          style={{ backgroundColor: theme.colors.brown, color: theme.colors.white }}
        >
          Add Driver
        </button>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>License Number</th>
            <th>Experience (years)</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {drivers.map((driver) => (
            <tr key={driver.id}>
              <td>
                {driver.first_name} {driver.last_name}
              </td>
              <td>{driver.phone}</td>
              <td>{driver.license_number}</td>
              <td>{driver.experience_years || 'N/A'}</td>
              <td>{driver.status}</td>
              <td>
                <button onClick={() => handleEdit(driver)}>Edit</button>
                <button onClick={() => handleDelete(driver.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Edit Driver' : 'Add Driver'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>License Number</label>
                <input
                  type="text"
                  value={formData.license_number}
                  onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Experience (years)</label>
                <input
                  type="number"
                  value={formData.experience_years}
                  onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
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
                  <option value="suspended">Suspended</option>
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

export default AdminDrivers

