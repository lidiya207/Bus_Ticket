import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useTheme } from '../context/ThemeContext'
import './SearchRoutes.css'

const BusDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const theme = useTheme()
  const [bus, setBus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBusDetails()
  }, [id])

  const fetchBusDetails = async () => {
    try {
      const response = await api.get(`/buses/${id}`)
      setBus(response.data.data)
    } catch (error) {
      console.error('Failed to fetch bus details:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (!bus) return <div>Bus not found</div>

  return (
    <div className="search-routes">
      <h1 style={{ color: theme.colors.black }}>Bus Details</h1>
      <div className="schedule-card" style={{ borderColor: theme.colors.brown }}>
        <h2>{bus.name}</h2>
        <p><strong>Type:</strong> {bus.type}</p>
        <p><strong>Capacity:</strong> {bus.capacity} seats</p>
        <p><strong>License Plate:</strong> {bus.license_plate}</p>
        <p><strong>Status:</strong> {bus.status}</p>
        {bus.features && (
          <div>
            <strong>Features:</strong>
            <ul>
              {bus.features.map((feature, idx) => (
                <li key={idx}>{feature}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default BusDetails

