import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'
import { useTheme } from '../context/ThemeContext'
import './SearchRoutes.css'

const Ticket = () => {
  const { reference } = useParams()
  const theme = useTheme()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qrCode, setQrCode] = useState(null)

  useEffect(() => {
    fetchTicket()
  }, [reference])

  const fetchTicket = async () => {
    try {
      const response = await api.get(`/bookings/reference/${reference}`)
      setBooking(response.data.data)
      if (response.data.data.qr_code_url) {
        setQrCode(response.data.data.qr_code_url)
      }
    } catch (error) {
      console.error('Failed to fetch ticket:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    try {
      const response = await api.get(`/bookings/reference/${reference}/download`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `ticket-${reference}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      alert('Failed to download ticket')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) return <div>Loading...</div>
  if (!booking) return <div>Ticket not found</div>

  return (
    <div className="search-routes" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: theme.colors.black }}>Bus Ticket</h1>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
          <button
            onClick={handlePrint}
            style={{
              backgroundColor: theme.colors.brown,
              color: theme.colors.white,
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Print Ticket
          </button>
          <button
            onClick={handleDownload}
            style={{
              backgroundColor: theme.colors.brown,
              color: theme.colors.white,
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Download PDF
          </button>
        </div>
      </div>

      <div
        className="schedule-card"
        style={{
          borderColor: theme.colors.brown,
          borderWidth: '3px',
          padding: '30px',
          backgroundColor: theme.colors.white,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ color: theme.colors.black, margin: 0 }}>Booking Reference</h2>
            <p style={{ fontSize: '18px', fontWeight: 'bold', color: theme.colors.brown }}>
              {booking.reference}
            </p>
          </div>
          {qrCode && (
            <div>
              <img src={qrCode} alt="QR Code" style={{ width: '120px', height: '120px' }} />
            </div>
          )}
        </div>

        <div style={{ borderTop: `2px solid ${theme.colors.brown}`, paddingTop: '20px', marginTop: '20px' }}>
          <h3 style={{ color: theme.colors.black }}>Passenger Information</h3>
          <p>
            <strong>Name:</strong> {booking.customer_name}
          </p>
          <p>
            <strong>Phone:</strong> {booking.customer_phone}
          </p>
          <p>
            <strong>Email:</strong> {booking.customer_email}
          </p>
        </div>

        <div style={{ borderTop: `2px solid ${theme.colors.brown}`, paddingTop: '20px', marginTop: '20px' }}>
          <h3 style={{ color: theme.colors.black }}>Trip Details</h3>
          <p>
            <strong>Route:</strong> {booking.schedule?.travel_route?.from} →{' '}
            {booking.schedule?.travel_route?.to}
          </p>
          <p>
            <strong>Departure:</strong> {new Date(booking.schedule?.departure_time).toLocaleString()}
          </p>
          <p>
            <strong>Arrival:</strong> {new Date(booking.schedule?.arrival_time).toLocaleString()}
          </p>
          <p>
            <strong>Bus:</strong> {booking.schedule?.bus?.name} ({booking.schedule?.bus?.plate_number})
          </p>
          <p>
            <strong>Seats:</strong> {booking.seats?.map((s) => s.seat_number).join(', ') || 'N/A'}
          </p>
        </div>

        <div style={{ borderTop: `2px solid ${theme.colors.brown}`, paddingTop: '20px', marginTop: '20px' }}>
          <h3 style={{ color: theme.colors.black }}>Payment Information</h3>
          <p>
            <strong>Total Amount:</strong> ${booking.total_amount}
          </p>
          <p>
            <strong>Payment Status:</strong>{' '}
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
          </p>
          <p>
            <strong>Booking Status:</strong>{' '}
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
          </p>
        </div>

        <div
          style={{
            marginTop: '30px',
            padding: '15px',
            backgroundColor: theme.colors.grayLight,
            borderRadius: '4px',
            fontSize: '12px',
            color: theme.colors.grayDark,
          }}
        >
          <p style={{ margin: 0 }}>
            <strong>Important:</strong> Please arrive at least 30 minutes before departure time. Bring a valid ID and
            this ticket (digital or printed) for boarding.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Ticket

