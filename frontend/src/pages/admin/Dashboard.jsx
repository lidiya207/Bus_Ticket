import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { useTheme } from '../../context/ThemeContext'
import './Dashboard.css'

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [revenue, setRevenue] = useState(null)
  const [loading, setLoading] = useState(true)
  const theme = useTheme()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [kpisRes, revenueRes] = await Promise.all([
        api.get('/dashboard/kpis'),
        api.get('/dashboard/revenue?period=month'),
      ])
      setStats(kpisRes.data.data)
      setRevenue(revenueRes.data.data)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="admin-dashboard">
      <h1 style={{ color: theme.colors.black }}>Admin Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card" style={{ borderColor: theme.colors.brown }}>
          <h3>Total Bookings</h3>
          <p className="stat-value">{stats?.total_bookings || 0}</p>
        </div>
        <div className="stat-card" style={{ borderColor: theme.colors.brown }}>
          <h3>Revenue (This Month)</h3>
          <p className="stat-value">${revenue?.total || 0}</p>
        </div>
        <div className="stat-card" style={{ borderColor: theme.colors.brown }}>
          <h3>Active Buses</h3>
          <p className="stat-value">{stats?.active_buses || 0}</p>
        </div>
        <div className="stat-card" style={{ borderColor: theme.colors.brown }}>
          <h3>Pending Bookings</h3>
          <p className="stat-value">{stats?.pending_bookings || 0}</p>
        </div>
      </div>

      <div className="quick-actions">
        <h2 style={{ color: theme.colors.black }}>Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/admin/buses" className="action-card" style={{ borderColor: theme.colors.brown }}>
            <h3>Manage Buses</h3>
          </Link>
          <Link to="/admin/routes" className="action-card" style={{ borderColor: theme.colors.brown }}>
            <h3>Manage Routes</h3>
          </Link>
          <Link to="/admin/schedules" className="action-card" style={{ borderColor: theme.colors.brown }}>
            <h3>Manage Schedules</h3>
          </Link>
          <Link to="/admin/bookings" className="action-card" style={{ borderColor: theme.colors.brown }}>
            <h3>View Bookings</h3>
          </Link>
          <Link to="/admin/drivers" className="action-card" style={{ borderColor: theme.colors.brown }}>
            <h3>Manage Drivers</h3>
          </Link>
          <Link to="/admin/reports" className="action-card" style={{ borderColor: theme.colors.brown }}>
            <h3>Reports & Analytics</h3>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard

