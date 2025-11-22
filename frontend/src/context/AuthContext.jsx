import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me')
      setUser(response.data.data)
    } catch (error) {
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { token, user: userData } = response.data.data
      localStorage.setItem('token', token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(userData)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      }
    }
  }

  const register = async (data) => {
    try {
      const response = await api.post('/auth/register', data)
      const token = response.data.data?.token || response.data.data?.access_token
      const userData = response.data.data?.user
      
      if (!token || !userData) {
        return {
          success: false,
          message: 'Invalid response from server',
        }
      }
      
      localStorage.setItem('token', token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(userData)
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.email?.[0] ||
                          error.response?.data?.errors?.password?.[0] ||
                          error.message || 
                          'Registration failed'
      return {
        success: false,
        message: errorMessage,
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }

  const hasRole = (role) => {
    return user?.roles?.some((r) => r.name === role) || false
  }

  const hasAnyRole = (roles) => {
    return roles.some((role) => hasRole(role))
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    hasRole,
    hasAnyRole,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

