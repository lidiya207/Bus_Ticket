import { useState, useEffect } from 'react'
import api from '../../services/api'
import { useTheme } from '../../context/ThemeContext'
import './AdminCommon.css'

const AdminReports = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('today')
  const theme = useTheme()

  useEffect(() => {
    fetchStats()
  }, [period])

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/stats', { params: { period } })
      setStats(response.data.data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1 style={{ color: theme.colors.black }}>Reports & Analytics</h1>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          style={{ padding: '8px' }}
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
          <div className="stat-card" style={{ borderColor: theme.colors.brown }}>
            <h3>Total Revenue</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: theme.colors.brown }}>
              ${stats.total_revenue || 0}
            </p>
          </div>
          <div className="stat-card" style={{ borderColor: theme.colors.brown }}>
            <h3>Total Bookings</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: theme.colors.brown }}>
              {stats.total_bookings || 0}
            </p>
          </div>
          <div className="stat-card" style={{ borderColor: theme.colors.brown }}>
            <h3>Active Buses</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: theme.colors.brown }}>
              {stats.active_buses || 0}
            </p>
          </div>
          <div className="stat-card" style={{ borderColor: theme.colors.brown }}>
            <h3>Total Routes</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: theme.colors.brown }}>
              {stats.total_routes || 0}
            </p>
          </div>
        </div>
      )}

      {stats?.route_performance && stats.route_performance.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <h2 style={{ color: theme.colors.black }}>Route Performance</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Route</th>
                <th>Bookings</th>
                <th>Revenue</th>
                <th>Utilization</th>
              </tr>
            </thead>
            <tbody>
              {stats.route_performance.map((route, idx) => (
                <tr key={idx}>
                  <td>
                    {route.from} → {route.to}
                  </td>
                  <td>{route.bookings}</td>
                  <td>${route.revenue}</td>
                  <td>{route.utilization}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {stats?.bus_utilization && stats.bus_utilization.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <h2 style={{ color: theme.colors.black }}>Bus Utilization</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Bus</th>
                <th>Total Trips</th>
                <th>Utilization</th>
              </tr>
            </thead>
            <tbody>
              {stats.bus_utilization.map((bus, idx) => (
                <tr key={idx}>
                  <td>{bus.name}</td>
                  <td>{bus.trips}</td>
                  <td>{bus.utilization}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminReports

