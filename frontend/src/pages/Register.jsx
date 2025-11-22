import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import './Login.css'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const theme = useTheme()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.password_confirmation) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    const result = await register(formData)
    setLoading(false)

    if (result.success) {
      navigate('/')
    } else {
      setError(result.message)
    }
  }

  return (
    <div className="login-container" style={{ backgroundColor: theme.colors.white }}>
      <div className="login-card" style={{ borderColor: theme.colors.brown }}>
        <h2 style={{ color: theme.colors.black }}>Register</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={{ borderColor: theme.colors.gray }}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{ borderColor: theme.colors.gray }}
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone (Optional)</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              style={{ borderColor: theme.colors.gray }}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              style={{ borderColor: theme.colors.gray }}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password_confirmation">Confirm Password</label>
            <input
              type="password"
              id="password_confirmation"
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              required
              style={{ borderColor: theme.colors.gray }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="submit-btn"
            style={{
              backgroundColor: theme.colors.brown,
              color: theme.colors.white,
            }}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="register-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  )
}

export default Register

