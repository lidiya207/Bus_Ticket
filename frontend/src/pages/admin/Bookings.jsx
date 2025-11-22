import { useState, useEffect } from 'react'
import api from '../../services/api'
import { useTheme } from '../../context/ThemeContext'
import './AdminCommon.css'

const AdminBookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const theme = useTheme()

  useEffect(() => {
    fetchBookings()
  }, [filter])

  const fetchBookings = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {}
      const response = await api.get('/bookings', { params })
      setBookings(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/bookings/${id}/status`, { status })
      fetchBookings()
    } catch (error) {
      alert('Failed to update booking status')
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1 style={{ color: theme.colors.black }}>Manage Bookings</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ padding: '8px', marginLeft: '20px' }}
        >
          <option value="all">All Bookings</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Reference</th>
            <th>Customer</th>
            <th>Route</th>
            <th>Departure</th>
            <th>Seats</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Payment</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id}>
              <td>{booking.reference}</td>
              <td>
                {booking.customer_name}
                <br />
                <small>{booking.customer_phone}</small>
              </td>
              <td>
                {booking.schedule?.travel_route?.from} → {booking.schedule?.travel_route?.to}
              </td>
              <td>{new Date(booking.schedule?.departure_time).toLocaleString()}</td>
              <td>{booking.seats?.length || 0}</td>
              <td>${booking.total_amount}</td>
              <td>
                <span
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor:
                      booking.status === 'confirmed'
                        ? '#4CAF50'
                        : booking.status === 'cancelled'
                        ? '#f44336'
                        : '#ff9800',
                    color: 'white',
                    fontSize: '12px',
                  }}
                >
                  {booking.status}
                </span>
              </td>
              <td>
                <span
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: booking.payment_status === 'paid' ? '#4CAF50' : '#f44336',
                    color: 'white',
                    fontSize: '12px',
                  }}
                >
                  {booking.payment_status}
                </span>
              </td>
              <td>
                {booking.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatusChange(booking.id, 'confirmed')}
                      style={{ marginRight: '5px', fontSize: '12px' }}
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => handleStatusChange(booking.id, 'cancelled')}
                      style={{ fontSize: '12px' }}
                    >
                      Cancel
                    </button>
                  </>
                )}
                <button
                  onClick={() => window.open(`/tickets/${booking.reference}`, '_blank')}
                  style={{ marginLeft: '5px', fontSize: '12px' }}
                >
                  View Ticket
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AdminBookings

