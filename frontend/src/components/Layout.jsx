import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import './Layout.css'

const Layout = () => {
  const { user, logout, hasRole } = useAuth()
  const theme = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="layout">
      <header className="header" style={{ backgroundColor: theme.colors.black, color: theme.colors.white }}>
        <div className="header-content">
          <Link to="/" className="logo">
            <h1>Bus Ticket System</h1>
          </Link>
          <nav className="nav">
            <Link to="/">Home</Link>
            <Link to="/search">Search Routes</Link>
            {user && (
              <>
                {hasRole('admin') && (
                  <>
                    <Link to="/admin">Dashboard</Link>
                    <Link to="/admin/buses">Buses</Link>
                    <Link to="/admin/routes">Routes</Link>
                    <Link to="/admin/bookings">Bookings</Link>
                  </>
                )}
                {hasRole('cashier') && (
                  <>
                    <Link to="/cashier">Cashier</Link>
                  </>
                )}
                {hasRole('customer') && (
                  <Link to="/bookings">My Bookings</Link>
                )}
                <div className="user-menu">
                  <span>{user.name}</span>
                  <button onClick={handleLogout} className="logout-btn">
                    Logout
                  </button>
                </div>
              </>
            )}
            {!user && <Link to="/login">Login</Link>}
          </nav>
        </div>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
      <footer className="footer" style={{ backgroundColor: theme.colors.black, color: theme.colors.white }}>
        <p>&copy; 2025 Bus Ticket Booking System. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default Layout

