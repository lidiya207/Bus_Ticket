import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useTheme } from '../context/ThemeContext'
import './SearchRoutes.css'

const Payment = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const theme = useTheme()
  const [booking, setBooking] = useState(null)
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchBooking()
  }, [id])

  const fetchBooking = async () => {
    try {
      const response = await api.get(`/bookings/${id}`)
      setBooking(response.data.data)
      initiatePayment()
    } catch (error) {
      console.error('Failed to fetch booking:', error)
    } finally {
      setLoading(false)
    }
  }

  const initiatePayment = async () => {
    try {
      const response = await api.post(`/bookings/${id}/payments/initiate`)
      setPayment(response.data.data)
    } catch (error) {
      console.error('Failed to initiate payment:', error)
    }
  }

  const handleMockPayment = async () => {
    setProcessing(true)
    try {
      // Simulate Telebirr payment approval
      await new Promise((resolve) => setTimeout(resolve, 2000))
      
      await api.post(`/bookings/${id}/payments/webhook`, {
        transaction_reference: payment.payment.transaction_reference,
        status: 'successful',
        payload: { phone: booking.customer_phone },
      })

      navigate(`/tickets/${booking.reference}`)
    } catch (error) {
      alert('Payment failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (!booking) return <div>Booking not found</div>

  return (
    <div className="search-routes">
      <h1>Payment</h1>
      <div className="schedule-card" style={{ borderColor: theme.colors.brown }}>
        <h2>Booking Summary</h2>
        <p><strong>Reference:</strong> {booking.reference}</p>
        <p><strong>Route:</strong> {booking.schedule?.travel_route?.from} → {booking.schedule?.travel_route?.to}</p>
        <p><strong>Total Amount:</strong> ${booking.total_amount}</p>
      </div>

      <div className="schedule-card" style={{ borderColor: theme.colors.brown, marginTop: '20px' }}>
        <h2>Telebirr Payment</h2>
        <p>This is a mock payment simulation.</p>
        {payment && (
          <div>
            <p><strong>Transaction Reference:</strong> {payment.payment.transaction_reference}</p>
            <p><strong>Checkout Token:</strong> {payment.checkout_token}</p>
            <p style={{ color: theme.colors.grayDark, fontSize: '14px' }}>
              {payment.instructions}
            </p>
          </div>
        )}
        <button
          onClick={handleMockPayment}
          disabled={processing || !payment}
          style={{
            backgroundColor: theme.colors.brown,
            color: theme.colors.white,
            padding: '12px 24px',
            fontSize: '16px',
            marginTop: '20px',
            width: '100%',
          }}
        >
          {processing ? 'Processing Payment...' : 'Approve Payment (Mock)'}
        </button>
      </div>
    </div>
  )
}

export default Payment

