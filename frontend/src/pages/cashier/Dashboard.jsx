import { useState, useEffect } from 'react'
import api from '../../services/api'
import { useTheme } from '../../context/ThemeContext'
import './CashierCommon.css'

const CashierDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const theme = useTheme()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/cashier-stats')
      setStats(response.data.data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="cashier-page">
      <h1 style={{ color: theme.colors.black }}>Cashier Dashboard</h1>
      {stats && (
        <div className="stats-grid">
          <div className="stat-card" style={{ borderColor: theme.colors.brown }}>
            <h3>Today's Bookings</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: theme.colors.brown }}>
              {stats.today_bookings || 0}
            </p>
          </div>
          <div className="stat-card" style={{ borderColor: theme.colors.brown }}>
            <h3>Today's Revenue</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: theme.colors.brown }}>
              ${stats.today_revenue || 0}
            </p>
          </div>
          <div className="stat-card" style={{ borderColor: theme.colors.brown }}>
            <h3>Pending Bookings</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: theme.colors.brown }}>
              {stats.pending_bookings || 0}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default CashierDashboard

