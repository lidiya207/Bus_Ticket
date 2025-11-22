import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useTheme } from '../context/ThemeContext'
import './SearchRoutes.css'

const SearchRoutes = () => {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [date, setDate] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [cities, setCities] = useState([])
  const [fromSuggestions, setFromSuggestions] = useState([])
  const [toSuggestions, setToSuggestions] = useState([])
  const [error, setError] = useState('')
  const theme = useTheme()
  const navigate = useNavigate()

  useEffect(() => {
    // Fetch available cities
    const fetchCities = async () => {
      try {
        const response = await api.get('/routes/cities')
        setCities(response.data.data?.all || [])
      } catch (error) {
        console.error('Failed to fetch cities:', error)
      }
    }
    fetchCities()
  }, [])

  const handleFromChange = (e) => {
    const value = e.target.value
    setFrom(value)
    if (value.length > 0) {
      const filtered = cities.filter(city =>
        city.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5)
      setFromSuggestions(filtered)
    } else {
      setFromSuggestions([])
    }
  }

  const handleToChange = (e) => {
    const value = e.target.value
    setTo(value)
    if (value.length > 0) {
      const filtered = cities.filter(city =>
        city.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5)
      setToSuggestions(filtered)
    } else {
      setToSuggestions([])
    }
  }

  const selectFromCity = (city) => {
    setFrom(city)
    setFromSuggestions([])
  }

  const selectToCity = (city) => {
    setTo(city)
    setToSuggestions([])
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

  const handleSearch = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await api.get('/schedules/search', {
        params: { from, to, date },
      })
      setResults(response.data.data || [])
      if (response.data.data && response.data.data.length === 0) {
        setError('No buses found for this route. Please try different cities or date.')
      }
    } catch (error) {
      console.error('Search failed:', error)
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        setError('Cannot connect to server. Please make sure the backend server is running on http://localhost:8000')
      } else if (error.response?.status === 404) {
        setError('Route not found. Please check if the backend server is running.')
      } else {
        setError(error.response?.data?.message || error.message || 'Search failed. Please try again.')
      }
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="search-routes">
      <h1>Search Bus Routes</h1>
      <form onSubmit={handleSearch} className="search-form">
        {error && <div className="error-message" style={{ color: '#ff4444', marginBottom: '1rem' }}>{error}</div>}
        <div className="form-row">
          <div className="form-group" style={{ position: 'relative' }}>
            <label>From</label>
            <input
              type="text"
              value={from}
              onChange={handleFromChange}
              required
              placeholder="Departure city"
              list="from-cities"
              autoComplete="off"
            />
            {fromSuggestions.length > 0 && (
              <ul className="suggestions-list">
                {fromSuggestions.map((city, idx) => (
                  <li key={idx} onClick={() => selectFromCity(city)}>
                    {city}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="form-group" style={{ position: 'relative' }}>
            <label>To</label>
            <input
              type="text"
              value={to}
              onChange={handleToChange}
              required
              placeholder="Destination city"
              list="to-cities"
              autoComplete="off"
            />
            {toSuggestions.length > 0 && (
              <ul className="suggestions-list">
                {toSuggestions.map((city, idx) => (
                  <li key={idx} onClick={() => selectToCity(city)}>
                    {city}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: theme.colors.brown,
              color: theme.colors.white,
            }}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {results.length > 0 && (
        <div className="results">
          <h2>Available Buses</h2>
          {results.map((schedule) => (
            <div
              key={schedule.id}
              className="schedule-card"
              style={{ borderColor: theme.colors.brown }}
            >
              <div className="schedule-info">
                <h3>
                  {schedule.travel_route?.from || schedule.travel_route?.origin_city} → {schedule.travel_route?.to || schedule.travel_route?.destination_city}
                </h3>
                <p>Bus: {getBusName(schedule.bus)}</p>
                <p>Departure: {new Date(schedule.departure_time).toLocaleString()}</p>
                <p>Arrival: {schedule.arrival_time ? new Date(schedule.arrival_time).toLocaleString() : 'N/A'}</p>
                <p>Price: ${schedule.price || schedule.base_fare || 0}</p>
                <p>Available Seats: {schedule.available_seats || 0}</p>
                {schedule.boarding_point && <p>Boarding: {schedule.boarding_point}</p>}
              </div>
              <button
                onClick={() => navigate(`/schedules/${schedule.id}/seats`)}
                style={{
                  backgroundColor: theme.colors.brown,
                  color: theme.colors.white,
                }}
              >
                Select Seats
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SearchRoutes

