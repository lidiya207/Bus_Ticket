import { useState, useEffect } from 'react'
import api from '../../services/api'
import { useTheme } from '../../context/ThemeContext'
import './CashierCommon.css'

const CashierBookings = () => {
  const [bookings, setBookings] = useState([])
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    schedule_id: '',
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    seat_ids: [],
  })
  const [selectedSeats, setSelectedSeats] = useState([])
  const [availableSeats, setAvailableSeats] = useState([])
  const theme = useTheme()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [bookingsRes, schedulesRes] = await Promise.all([
        api.get('/bookings'),
        api.get('/schedules'),
      ])
      setBookings(bookingsRes.data.data || [])
      setSchedules(schedulesRes.data.data || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleScheduleChange = async (scheduleId) => {
    try {
      const response = await api.get(`/schedules/${scheduleId}/seats`)
      setAvailableSeats(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch seats:', error)
    }
  }

  const toggleSeat = (seatId) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((id) => id !== seatId))
    } else {
      setSelectedSeats([...selectedSeats, seatId])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/bookings/cashier', {
        ...formData,
        seat_ids: selectedSeats,
      })
      setShowModal(false)
      setFormData({
        schedule_id: '',
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        seat_ids: [],
      })
      setSelectedSeats([])
      fetchData()
    } catch (error) {
      alert('Failed to create booking')
    }
  }

  const handleVerifyQR = async (reference) => {
    try {
      const response = await api.get(`/bookings/${reference}/verify`)
      alert(`Booking Status: ${response.data.data.status}`)
    } catch (error) {
      alert('Invalid QR code or booking not found')
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="cashier-page">
      <div className="page-header">
        <h1 style={{ color: theme.colors.black }}>Manage Bookings</h1>
        <button
          onClick={() => {
            setFormData({
              schedule_id: '',
              customer_name: '',
              customer_phone: '',
              customer_email: '',
              seat_ids: [],
            })
            setSelectedSeats([])
            setShowModal(true)
          }}
          style={{ backgroundColor: theme.colors.brown, color: theme.colors.white }}
        >
          New Booking
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Enter booking reference to verify QR"
          onKeyPress={async (e) => {
            if (e.key === 'Enter') {
              await handleVerifyQR(e.target.value)
            }
          }}
          style={{ padding: '8px', width: '300px', marginRight: '10px' }}
        />
        <button
          onClick={() => {
            const ref = prompt('Enter booking reference:')
            if (ref) handleVerifyQR(ref)
          }}
          style={{ backgroundColor: theme.colors.brown, color: theme.colors.white, padding: '8px 16px' }}
        >
          Verify QR
        </button>
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
              <td>{booking.status}</td>
              <td>
                <button
                  onClick={() => window.open(`/tickets/${booking.reference}`, '_blank')}
                  style={{ fontSize: '12px' }}
                >
                  Print Ticket
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <h2>Create Walk-in Booking</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Schedule</label>
                <select
                  value={formData.schedule_id}
                  onChange={(e) => {
                    setFormData({ ...formData, schedule_id: e.target.value })
                    handleScheduleChange(e.target.value)
                  }}
                  required
                >
                  <option value="">Select Schedule</option>
                  {schedules.map((schedule) => (
                    <option key={schedule.id} value={schedule.id}>
                      {schedule.travel_route?.from} → {schedule.travel_route?.to} -{' '}
                      {new Date(schedule.departure_time).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Customer Name</label>
                <input
                  type="text"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Customer Phone</label>
                <input
                  type="tel"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Customer Email</label>
                <input
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                  required
                />
              </div>
              {formData.schedule_id && (
                <div className="form-group">
                  <label>Select Seats</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginTop: '10px' }}>
                    {availableSeats.map((seat) => (
                      <button
                        key={seat.id}
                        type="button"
                        onClick={() => toggleSeat(seat.id)}
                        disabled={seat.status === 'occupied' || seat.status === 'locked'}
                        style={{
                          padding: '8px',
                          backgroundColor: selectedSeats.includes(seat.id)
                            ? theme.colors.brown
                            : seat.status === 'occupied' || seat.status === 'locked'
                            ? theme.colors.gray
                            : theme.colors.white,
                          color: selectedSeats.includes(seat.id) ? theme.colors.white : theme.colors.black,
                          border: `1px solid ${theme.colors.brown}`,
                          cursor: seat.status === 'occupied' || seat.status === 'locked' ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {seat.seat_number}
                      </button>
                    ))}
                  </div>
                  <p style={{ marginTop: '10px', fontSize: '14px' }}>
                    Selected: {selectedSeats.length} seat(s)
                  </p>
                </div>
              )}
              <div className="form-actions">
                <button type="submit" style={{ backgroundColor: theme.colors.brown, color: theme.colors.white }}>
                  Create Booking
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

export default CashierBookings

