import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import SearchRoutes from './pages/SearchRoutes'
import BusDetails from './pages/BusDetails'
import SeatSelection from './pages/SeatSelection'
import BookingConfirmation from './pages/BookingConfirmation'
import Payment from './pages/Payment'
import Ticket from './pages/Ticket'
import AdminDashboard from './pages/admin/Dashboard'
import AdminBuses from './pages/admin/Buses'
import AdminRoutes from './pages/admin/Routes'
import AdminSchedules from './pages/admin/Schedules'
import AdminDrivers from './pages/admin/Drivers'
import AdminBookings from './pages/admin/Bookings'
import AdminCashiers from './pages/admin/Cashiers'
import AdminReports from './pages/admin/Reports'
import CashierDashboard from './pages/cashier/Dashboard'
import CashierBookings from './pages/cashier/Bookings'
import CashierCustomers from './pages/cashier/Customers'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="search" element={<SearchRoutes />} />
              <Route path="buses/:id" element={<BusDetails />} />
              <Route path="schedules/:id/seats" element={<SeatSelection />} />
              <Route path="bookings/:id/confirm" element={<BookingConfirmation />} />
              <Route path="bookings/:id/payment" element={<Payment />} />
              <Route path="tickets/:reference" element={<Ticket />} />
              
              {/* Admin Routes */}
              <Route
                path="admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/buses"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminBuses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/routes"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminRoutes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/schedules"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminSchedules />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/drivers"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDrivers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/bookings"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminBookings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/cashiers"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminCashiers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/reports"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminReports />
                  </ProtectedRoute>
                }
              />
              
              {/* Cashier Routes */}
              <Route
                path="cashier"
                element={
                  <ProtectedRoute allowedRoles={['cashier', 'admin']}>
                    <CashierDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="cashier/bookings"
                element={
                  <ProtectedRoute allowedRoles={['cashier', 'admin']}>
                    <CashierBookings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="cashier/customers"
                element={
                  <ProtectedRoute allowedRoles={['cashier', 'admin']}>
                    <CashierCustomers />
                  </ProtectedRoute>
                }
              />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App

