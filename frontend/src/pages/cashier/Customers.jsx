import { useState, useEffect } from 'react'
import api from '../../services/api'
import { useTheme } from '../../context/ThemeContext'
import './CashierCommon.css'

const CashierCustomers = () => {
  const [customers, setCustomers] = useState([])
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
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/users', { params: { role: 'customer' } })
      setCustomers(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/users', {
        ...formData,
        role: 'customer',
      })
      setShowModal(false)
      setFormData({ name: '', email: '', phone: '', password: '' })
      fetchCustomers()
    } catch (error) {
      alert('Failed to register customer')
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="cashier-page">
      <div className="page-header">
        <h1 style={{ color: theme.colors.black }}>Register Walk-in Customers</h1>
        <button
          onClick={() => {
            setFormData({ name: '', email: '', phone: '', password: '' })
            setShowModal(true)
          }}
          style={{ backgroundColor: theme.colors.brown, color: theme.colors.white }}
        >
          Register Customer
        </button>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Registered</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td>{customer.name}</td>
              <td>{customer.email}</td>
              <td>{customer.phone || 'N/A'}</td>
              <td>{new Date(customer.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Register Customer</h2>
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
                  Register
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

export default CashierCustomers

