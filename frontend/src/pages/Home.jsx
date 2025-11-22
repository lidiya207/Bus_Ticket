import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import api from '../services/api'
import './Home.css'

const Home = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const [upcomingSchedules, setUpcomingSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [busTypes, setBusTypes] = useState([])

  useEffect(() => {
    fetchUpcomingSchedules()
  }, [])

  const fetchUpcomingSchedules = async () => {
    try {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const dateStr = tomorrow.toISOString().split('T')[0]

      const response = await api.get('/schedules', {
        params: { date: dateStr },
      })
      
      const schedules = response.data.data?.data || response.data.data || []
      setUpcomingSchedules(schedules.slice(0, 6)) // Show first 6 schedules
      
      // Extract bus types from schedules
      const types = [...new Set(
        schedules
          .map(s => s.bus?.type)
          .filter(Boolean)
      )]
      setBusTypes(types.length > 0 ? types : ['VIP', 'Standard', 'Luxury'])
    } catch (error) {
      console.error('Failed to fetch schedules:', error)
      // Fallback to default types
      setBusTypes(['VIP', 'Standard', 'Luxury'])
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const getBusTypeLabel = (type) => {
    if (!type) return 'Standard'
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()
  }

  const getBusName = (bus) => {
    if (!bus) return 'N/A'
    const code = bus.code || ''
    // Convert codes like "SELAM-001" to "Selam Bus"
    if (code.includes('SELAM')) return 'Selam Bus'
    if (code.includes('SKY')) return 'Sky Bus'
    if (code.includes('TATA')) return 'Tata Bus'
    if (code.includes('ABAY')) return 'Abay Bus'
    if (code.includes('GHION')) return 'Ghion Bus'
    return code || bus.name || 'Bus'
  }

  return (
    <div className="home">
      <section className="hero" style={{ backgroundColor: theme.colors.grayLight }}>
        <div className="hero-content">
          <h1 style={{ color: theme.colors.black }}>Book Your Bus Ticket</h1>
          <p style={{ color: theme.colors.grayDark }}>
            Find and book bus tickets to your favorite destinations
          </p>
          <Link
            to="/search"
            className="cta-button"
            style={{
              backgroundColor: theme.colors.brown,
              color: theme.colors.white,
            }}
          >
            Search Routes
          </Link>
        </div>
      </section>

      {/* Bus Types Section */}
      <section className="bus-types-section">
        <h2 style={{ color: theme.colors.black }}>Available Bus Types</h2>
        <div className="bus-types-grid">
          {busTypes.length > 0 ? (
            busTypes.map((type, index) => (
              <div
                key={index}
                className="bus-type-card"
                style={{ borderColor: theme.colors.brown }}
              >
                <div className="bus-type-icon">
                  {type === 'VIP' || type === 'vip' ? '⭐' : type === 'Luxury' || type === 'luxury' ? '✨' : '🚌'}
                </div>
                <h3>{getBusTypeLabel(type)}</h3>
                <p>
                  {type === 'VIP' || type === 'vip'
                    ? 'Premium comfort with extra legroom'
                    : type === 'Luxury' || type === 'luxury'
                    ? 'Ultimate luxury experience'
                    : 'Comfortable standard seating'}
                </p>
              </div>
            ))
          ) : (
            <>
              <div className="bus-type-card" style={{ borderColor: theme.colors.brown }}>
                <div className="bus-type-icon">⭐</div>
                <h3>VIP</h3>
                <p>Premium comfort with extra legroom</p>
              </div>
              <div className="bus-type-card" style={{ borderColor: theme.colors.brown }}>
                <div className="bus-type-icon">🚌</div>
                <h3>Standard</h3>
                <p>Comfortable standard seating</p>
              </div>
              <div className="bus-type-card" style={{ borderColor: theme.colors.brown }}>
                <div className="bus-type-icon">✨</div>
                <h3>Luxury</h3>
                <p>Ultimate luxury experience</p>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Upcoming Schedules Section */}
      <section className="schedules-section">
        <h2 style={{ color: theme.colors.black }}>Upcoming Departures</h2>
        {loading ? (
          <div className="loading">Loading schedules...</div>
        ) : upcomingSchedules.length > 0 ? (
          <div className="schedules-grid">
            {upcomingSchedules.map((schedule) => (
              <div
                key={schedule.id}
                className="schedule-card-home"
                style={{ borderColor: theme.colors.brown }}
                onClick={() => navigate(`/schedules/${schedule.id}/seats`)}
              >
                <div className="schedule-time">
                  <div className="time-main">{formatTime(schedule.departure_time)}</div>
                  <div className="time-date">{formatDate(schedule.departure_time)}</div>
                </div>
                <div className="schedule-details">
                  <h3>
                    {schedule.travel_route?.origin_city || schedule.travel_route?.from} →{' '}
                    {schedule.travel_route?.destination_city || schedule.travel_route?.to}
                  </h3>
                  <div className="schedule-info-row">
                    <div>
                      <span className="bus-name">{getBusName(schedule.bus)}</span>
                      <span className="bus-type-badge">
                        {getBusTypeLabel(schedule.bus?.type)}
                      </span>
                    </div>
                    <span className="price">${schedule.base_fare || schedule.price || 0}</span>
                  </div>
                  {schedule.boarding_point && (
                    <p className="boarding-point">📍 {schedule.boarding_point}</p>
                  )}
                </div>
                <div className="schedule-action">
                  <button
                    className="book-btn"
                    style={{
                      backgroundColor: theme.colors.brown,
                      color: theme.colors.white,
                    }}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-schedules">
            <p>No upcoming schedules available. Check back later!</p>
          </div>
        )}
        {upcomingSchedules.length > 0 && (
          <div className="view-all">
            <Link
              to="/search"
              style={{
                color: theme.colors.brown,
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              View All Schedules →
            </Link>
          </div>
        )}
      </section>

      <section className="features">
        <h2 style={{ color: theme.colors.black }}>Why Choose Us?</h2>
        <div className="features-grid">
          <div className="feature-card" style={{ borderColor: theme.colors.brown }}>
            <h3>Easy Booking</h3>
            <p>Book your tickets in just a few clicks</p>
          </div>
          <div className="feature-card" style={{ borderColor: theme.colors.brown }}>
            <h3>Real-time Updates</h3>
            <p>Get live updates on bus schedules and availability</p>
          </div>
          <div className="feature-card" style={{ borderColor: theme.colors.brown }}>
            <h3>Secure Payment</h3>
            <p>Safe and secure payment processing</p>
          </div>
          <div className="feature-card" style={{ borderColor: theme.colors.brown }}>
            <h3>Mobile Friendly</h3>
            <p>Book tickets on any device, anywhere</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home

