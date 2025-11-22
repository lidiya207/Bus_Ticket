import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import api from '../services/api'
import { useTheme } from '../context/ThemeContext'
import './SearchRoutes.css'

const BookingConfirmation = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const [schedule, setSchedule] = useState(null)
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    seat_labels: location.state?.seatLabels || [],
    lock_token: location.state?.lockToken || null,
    schedule_id: id,
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchSchedule()
  }, [id])

  const fetchSchedule = async () => {
    try {
      const response = await api.get(`/schedules/${id}`)
      setSchedule(response.data.data)
    } catch (error) {
      console.error('Failed to fetch schedule:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await api.post('/bookings', formData)
      navigate(`/bookings/${response.data.data.id}/payment`)
    } catch (error) {
      alert(error.response?.data?.message || 'Booking failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (!schedule) return <div>Schedule not found</div>

  const totalPrice = (schedule.base_fare || schedule.price || 0) * formData.seat_labels.length

  return (
    <div className="search-routes">
      <h1>Confirm Booking</h1>
      <div className="schedule-card" style={{ borderColor: theme.colors.brown }}>
        <h2>Trip Details</h2>
        <p>
          <strong>Route:</strong> {schedule.travel_route?.from} → {schedule.travel_route?.to}
        </p>
        <p>
          <strong>Departure:</strong> {new Date(schedule.departure_time).toLocaleString()}
        </p>
        <p>
          <strong>Bus:</strong> {schedule.bus?.name}
        </p>
        <p>
          <strong>Seats Selected:</strong> {formData.seat_labels.length}
        </p>
        <p>
          <strong>Price per Seat:</strong> ${schedule.base_fare || schedule.price || 0}
        </p>
        <p>
          <strong>Total Price:</strong> ${totalPrice}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="search-form">
        <h2>Passenger Information</h2>
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            name="customer_name"
            value={formData.customer_name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input
            type="tel"
            name="customer_phone"
            value={formData.customer_phone}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="customer_email"
            value={formData.customer_email}
            onChange={handleChange}
            required
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          style={{
            backgroundColor: theme.colors.brown,
            color: theme.colors.white,
            padding: '12px 24px',
            fontSize: '16px',
          }}
        >
          {submitting ? 'Processing...' : 'Proceed to Payment'}
        </button>
      </form>
    </div>
  )
}

export default BookingConfirmation

