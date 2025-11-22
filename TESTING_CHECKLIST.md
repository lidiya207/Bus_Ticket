# ✅ Testing Checklist - Bus Ticket System

## Pre-Flight Checks

### Backend Setup
- [ ] Database created (MySQL)
- [ ] `.env` file configured with database credentials
- [ ] Dependencies installed: `composer install`
- [ ] Migrations run: `php artisan migrate`
- [ ] Seeders run: `php artisan db:seed`
- [ ] Backend server starts: `php artisan serve`

### Frontend Setup
- [ ] Dependencies installed: `npm install`
- [ ] `.env` file exists with `VITE_API_URL=http://localhost:8000/api`
- [ ] Frontend server starts: `npm run dev`

---

## 🧪 Test Scenarios

### 1. Authentication Tests

#### Register New Customer
- [ ] Go to homepage
- [ ] Click "Register" or navigate to `/register`
- [ ] Fill in: Name, Email, Phone, Password
- [ ] Submit registration
- [ ] ✅ Should redirect to homepage or dashboard
- [ ] ✅ Should be logged in automatically

#### Login as Admin
- [ ] Go to `/login`
- [ ] Enter: `admin@busticket.com` / `password`
- [ ] Submit
- [ ] ✅ Should see admin dashboard
- [ ] ✅ Navigation should show admin menu items

#### Login as Cashier
- [ ] Logout if logged in
- [ ] Login with: `cashier@busticket.com` / `password`
- [ ] ✅ Should see cashier dashboard
- [ ] ✅ Should have cashier-specific menu

#### Login as Customer
- [ ] Logout if logged in
- [ ] Login with: `customer@busticket.com` / `password`
- [ ] ✅ Should see customer view
- [ ] ✅ Should NOT see admin/cashier menus

---

### 2. Customer Booking Flow

#### Search Routes
- [ ] Navigate to "Search Routes"
- [ ] Enter origin city (e.g., "Addis Ababa")
- [ ] Enter destination city (e.g., "Hawassa")
- [ ] Select a date (future date)
- [ ] Click "Search"
- [ ] ✅ Should show available schedules
- [ ] ✅ Should display route, time, price, bus details

#### View Bus Details
- [ ] Click on a schedule/bus
- [ ] ✅ Should show bus information
- [ ] ✅ Should show amenities
- [ ] ✅ Should have "Select Seats" button

#### Select Seats
- [ ] Click "Select Seats"
- [ ] ✅ Should see seat map
- [ ] ✅ Available seats should be clickable (green)
- [ ] ✅ Booked seats should be disabled (red)
- [ ] Click on 2-3 available seats
- [ ] ✅ Selected seats should highlight
- [ ] Click "Continue to Booking"
- [ ] ✅ Should navigate to booking confirmation

#### Complete Booking
- [ ] Fill passenger information:
  - Name
  - Phone
  - Email
- [ ] Verify booking summary (route, seats, price)
- [ ] Click "Proceed to Payment"
- [ ] ✅ Should create booking
- [ ] ✅ Should navigate to payment page

#### Mock Payment
- [ ] On payment page, verify:
  - Booking reference displayed
  - Total amount correct
  - Transaction reference shown
- [ ] Click "Approve Payment (Mock)"
- [ ] ✅ Should process payment (2 second delay)
- [ ] ✅ Should redirect to ticket page

#### View Ticket
- [ ] ✅ Should see booking reference
- [ ] ✅ Should see QR code
- [ ] ✅ Should see passenger details
- [ ] ✅ Should see trip details
- [ ] ✅ Should see payment status: "paid"
- [ ] ✅ Should see booking status: "confirmed"
- [ ] Click "Print Ticket"
- [ ] ✅ Should open print dialog
- [ ] Click "Download PDF"
- [ ] ✅ Should download ticket (or show data)

---

### 3. Admin Features

#### Dashboard
- [ ] Login as admin
- [ ] Navigate to `/admin`
- [ ] ✅ Should see dashboard with:
  - Total bookings
  - Total revenue
  - Active buses
  - Today's bookings
- [ ] ✅ Should see charts/graphs

#### Manage Buses
- [ ] Navigate to `/admin/buses`
- [ ] ✅ Should see list of buses
- [ ] Click "Add Bus"
- [ ] Fill form:
  - Name: "Test Bus"
  - Plate Number: "AA-99999"
  - Capacity: 45
  - Type: Standard
  - Status: Active
- [ ] Submit
- [ ] ✅ Should see new bus in list
- [ ] Click "Edit" on a bus
- [ ] ✅ Should open edit form with pre-filled data
- [ ] Change capacity to 50
- [ ] Submit
- [ ] ✅ Should update bus
- [ ] Click "Delete" on a bus
- [ ] ✅ Should remove bus from list

#### Manage Routes
- [ ] Navigate to `/admin/routes`
- [ ] ✅ Should see list of routes
- [ ] Click "Add Route"
- [ ] Fill form:
  - Origin: "Addis Ababa"
  - Destination: "Dire Dawa"
  - Distance: 500 km
  - Duration: 6 hours
  - Base Price: 800
- [ ] Submit
- [ ] ✅ Should create new route

#### Manage Schedules
- [ ] Navigate to `/admin/schedules`
- [ ] ✅ Should see list of schedules
- [ ] Click "Add Schedule"
- [ ] Select bus, route, driver
- [ ] Set departure time (future)
- [ ] Set arrival time
- [ ] Set base fare
- [ ] Submit
- [ ] ✅ Should create schedule

#### Manage Drivers
- [ ] Navigate to `/admin/drivers`
- [ ] ✅ Should see list of drivers
- [ ] Add new driver
- [ ] ✅ Should create driver

#### View Bookings
- [ ] Navigate to `/admin/bookings`
- [ ] ✅ Should see all bookings
- [ ] ✅ Should see customer details
- [ ] ✅ Should see booking status
- [ ] ✅ Should be able to filter by status

#### Reports
- [ ] Navigate to `/admin/reports`
- [ ] ✅ Should see revenue reports
- [ ] ✅ Should see route performance
- [ ] ✅ Should see bus utilization

---

### 4. Cashier Features

#### Cashier Dashboard
- [ ] Login as cashier
- [ ] Navigate to `/cashier`
- [ ] ✅ Should see cashier dashboard
- [ ] ✅ Should show today's stats

#### Register Walk-in Customer
- [ ] Navigate to `/cashier/customers`
- [ ] Click "Register Customer"
- [ ] Fill customer details
- [ ] Submit
- [ ] ✅ Should create customer account

#### Manual Booking
- [ ] Navigate to `/cashier/bookings`
- [ ] Click "New Booking"
- [ ] Select schedule
- [ ] Select seats
- [ ] Enter customer info
- [ ] Submit
- [ ] ✅ Should create booking immediately (confirmed)
- [ ] ✅ Should generate QR code

#### Verify QR Code
- [ ] Get a booking reference
- [ ] Navigate to verify QR page (if exists)
- [ ] Enter booking reference
- [ ] ✅ Should show booking details
- [ ] ✅ Should show if valid/invalid

---

### 5. Error Handling Tests

#### Invalid Login
- [ ] Try login with wrong password
- [ ] ✅ Should show error message
- [ ] ✅ Should NOT redirect

#### Booking Without Seats
- [ ] Try to proceed without selecting seats
- [ ] ✅ Should show alert/error

#### Expired Seat Lock
- [ ] Select seats
- [ ] Wait 5+ minutes (if lock TTL is 5 min)
- [ ] Try to book
- [ ] ✅ Should handle gracefully

#### Network Errors
- [ ] Stop backend server
- [ ] Try to search routes
- [ ] ✅ Should show error message
- [ ] ✅ Should NOT crash frontend

---

## 🐛 Common Issues & Fixes

### Backend Issues

**Problem:** `Class 'Passport' not found`
- **Fix:** Run `composer require laravel/passport` (already installed)

**Problem:** `SQLSTATE[HY000] [1045] Access denied`
- **Fix:** Check `.env` database credentials

**Problem:** `Route [api.auth.login] not defined`
- **Fix:** Check `routes/api.php` has auth routes

**Problem:** `Token mismatch` or `419 error`
- **Fix:** Clear cache: `php artisan config:clear`

### Frontend Issues

**Problem:** `Cannot GET /api/routes`
- **Fix:** Check backend is running on port 8000
- **Fix:** Check `VITE_API_URL` in `.env`

**Problem:** `CORS error`
- **Fix:** Backend should handle CORS (Laravel default)
- **Fix:** Check `config/cors.php`

**Problem:** `401 Unauthorized`
- **Fix:** Check token in localStorage
- **Fix:** Try logging in again

**Problem:** Blank page / White screen
- **Fix:** Check browser console for errors
- **Fix:** Verify React app compiled: `npm run build`

---

## 📊 Performance Checks

- [ ] Page load time < 2 seconds
- [ ] API response time < 500ms
- [ ] Seat selection updates instantly
- [ ] No console errors
- [ ] No network errors (except intentional)

---

## 🎨 UI/UX Checks

- [ ] Theme colors applied (Black/White/Brown)
- [ ] Buttons are clickable and responsive
- [ ] Forms validate input
- [ ] Error messages are clear
- [ ] Success messages appear
- [ ] Mobile responsive (test on phone/tablet)
- [ ] Navigation works correctly
- [ ] Protected routes redirect properly

---

## ✅ Final Verification

Before considering complete:

- [ ] All test scenarios pass
- [ ] No critical errors in console
- [ ] Database seeded with sample data
- [ ] Can complete full booking flow
- [ ] Admin can manage all resources
- [ ] Cashier can create bookings
- [ ] QR codes generate correctly
- [ ] Tickets can be viewed/downloaded

---

## 🚀 Ready for Production?

Before deploying:

- [ ] Change default passwords
- [ ] Configure real email service
- [ ] Set up real payment gateway
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Set `APP_DEBUG=false`
- [ ] Run `php artisan config:cache`
- [ ] Run `npm run build` for frontend
- [ ] Set up database backups
- [ ] Configure error logging

---

**Happy Testing! 🎉**

If all tests pass, your system is ready to use!

