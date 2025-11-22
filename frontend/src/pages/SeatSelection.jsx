import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useTheme } from '../context/ThemeContext'
import './SeatSelection.css'

const SeatSelection = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const theme = useTheme()
  const [schedule, setSchedule] = useState(null)
  const [seats, setSeats] = useState([])
  const [selectedSeats, setSelectedSeats] = useState([])
  const [loading, setLoading] = useState(true)
  const [lockToken, setLockToken] = useState(null)

  useEffect(() => {
    fetchSchedule()
    fetchSeats()
  }, [id])

  const fetchSchedule = async () => {
    try {
      const response = await api.get(`/schedules/${id}`)
      setSchedule(response.data.data)
    } catch (error) {
      console.error('Failed to fetch schedule:', error)
    }
  }

  const fetchSeats = async () => {
    try {
      const response = await api.get(`/schedules/${id}/seats`)
      setSeats(response.data.seats || [])
    } catch (error) {
      console.error('Failed to fetch seats:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleSeat = async (seatLabel) => {
    if (selectedSeats.includes(seatLabel)) {
      setSelectedSeats(selectedSeats.filter((label) => label !== seatLabel))
    } else {
      setSelectedSeats([...selectedSeats, seatLabel])
    }
  }

  const lockSeats = async () => {
    if (selectedSeats.length === 0) return
    
    try {
      const response = await api.post(`/schedules/${id}/locks`, {
        seat_labels: selectedSeats,
      })
      setLockToken(response.data.data.lock_token)
    } catch (error) {
      alert('Failed to lock seats. Please try again.')
    }
  }

  const handleContinue = async () => {
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat')
      return
    }
    
    if (!lockToken) {
      await lockSeats()
    }
    
    navigate(`/bookings/${id}/confirm`, { 
      state: { 
        seatLabels: selectedSeats,
        lockToken: lockToken,
      } 
    })
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="seat-selection">
      <h1>Select Your Seats</h1>
      {schedule && (
        <div className="schedule-info">
          <p>
            {schedule.travel_route?.from} → {schedule.travel_route?.to}
          </p>
          <p>Departure: {new Date(schedule.departure_time).toLocaleString()}</p>
        </div>
      )}
      <div className="seat-map">
        <div className="seat-legend">
          <div className="legend-item">
            <div className="seat available"></div>
            <span>Available</span>
          </div>
          <div className="legend-item">
            <div className="seat selected"></div>
            <span>Selected</span>
          </div>
          <div className="legend-item">
            <div className="seat occupied"></div>
            <span>Occupied</span>
          </div>
        </div>
        <div className="seats-grid">
          {seats.map((seat) => (
            <button
              key={seat.label}
              className={`seat ${seat.status} ${
                selectedSeats.includes(seat.label) ? 'selected' : ''
              }`}
              onClick={() => toggleSeat(seat.label)}
              disabled={seat.status === 'booked' || seat.status === 'locked'}
            >
              {seat.label}
            </button>
          ))}
        </div>
      </div>
      <div className="selection-summary">
        <p>Selected: {selectedSeats.length} seat(s)</p>
        <button
          onClick={handleContinue}
          style={{
            backgroundColor: theme.colors.brown,
            color: theme.colors.white,
          }}
        >
          Continue to Booking
        </button>
      </div>
    </div>
  )
}

export default SeatSelection

