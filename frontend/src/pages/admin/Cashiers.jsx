import { useState, useEffect } from 'react'
import api from '../../services/api'
import { useTheme } from '../../context/ThemeContext'
import './AdminCommon.css'

const AdminCashiers = () => {
  const [cashiers, setCashiers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  })
  const theme = useTheme()

  useEffect(() => {
    fetchCashiers()
  }, [])

  const fetchCashiers = async () => {
    try {
      const response = await api.get('/users', { params: { role: 'cashier' } })
      setCashiers(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch cashiers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/users', {
        ...formData,
        role: 'cashier',
      })
      setShowModal(false)
      setFormData({ name: '', email: '', phone: '', password: '' })
      fetchCashiers()
    } catch (error) {
      alert('Failed to create cashier')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this cashier?')) return
    try {
      await api.delete(`/users/${id}`)
      fetchCashiers()
    } catch (error) {
      alert('Failed to remove cashier')
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1 style={{ color: theme.colors.black }}>Manage Cashiers</h1>
        <button
          onClick={() => {
            setFormData({ name: '', email: '', phone: '', password: '' })
            setShowModal(true)
          }}
          style={{ backgroundColor: theme.colors.brown, color: theme.colors.white }}
        >
          Add Cashier
        </button>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {cashiers.map((cashier) => (
            <tr key={cashier.id}>
              <td>{cashier.name}</td>
              <td>{cashier.email}</td>
              <td>{cashier.phone || 'N/A'}</td>
              <td>
                <button onClick={() => handleDelete(cashier.id)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add Cashier</h2>
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
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                <label>Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" style={{ backgroundColor: theme.colors.brown, color: theme.colors.white }}>
                  Create
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

export default AdminCashiers

