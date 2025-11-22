# 🚀 Quick Start Guide - Testing & Running

## Step 1: Start Backend (Laravel API)

Open a **new terminal/PowerShell window** and run:

```bash
cd "C:\Users\Lidiya Getale\Desktop\Bus_Ticket\backend"
php artisan serve
```

✅ Backend will run at: **http://localhost:8000**
✅ API endpoints at: **http://localhost:8000/api**

**Keep this terminal window open!**

---

## Step 2: Start Frontend (React)

Open **another new terminal/PowerShell window** and run:

```bash
cd "C:\Users\Lidiya Getale\Desktop\Bus_Ticket\frontend"
npm run dev
```

✅ Frontend will run at: **http://localhost:5173**

**Keep this terminal window open too!**

---

## Step 3: Access the Application

Open your browser and go to:
👉 **http://localhost:5173**

---

## Step 4: Test Login Credentials

### Admin Account:
- **Email:** `admin@busticket.com`
- **Password:** `password`
- **Access:** Full admin dashboard, manage buses, routes, schedules, drivers, view all bookings, reports

### Cashier Account:
- **Email:** `cashier@busticket.com`
- **Password:** `password`
- **Access:** Cashier dashboard, register walk-in customers, manual bookings, verify QR codes

### Customer Account:
- **Email:** `customer@busticket.com`
- **Password:** `password`
- **Access:** Search routes, book tickets, view bookings

Or **register a new customer account** from the homepage!

---

## Step 5: Test the Features

### As Customer:
1. **Search Routes:** Go to "Search Routes" → Enter origin, destination, date
2. **Select Bus:** View available buses and schedules
3. **Select Seats:** Click on available seats (green = available, red = booked)
4. **Book Ticket:** Fill passenger info → Proceed to payment
5. **Mock Payment:** Click "Approve Payment (Mock)" to simulate Telebirr
6. **View Ticket:** See QR code and download ticket

### As Admin:
1. **Dashboard:** View statistics and analytics
2. **Manage Buses:** Add/edit/delete buses
3. **Manage Routes:** Create routes between cities
4. **Manage Schedules:** Create schedules for routes
5. **Manage Drivers:** Add driver information
6. **View Bookings:** See all bookings
7. **Reports:** View revenue and utilization reports

### As Cashier:
1. **Dashboard:** View cashier statistics
2. **Register Customer:** Add walk-in customer
3. **Book Ticket:** Manually book tickets for customers
4. **Verify QR:** Scan and verify ticket QR codes

---

## 🔧 Troubleshooting

### Backend Not Starting?
- Make sure MySQL/XAMPP is running
- Check if port 8000 is available
- Run: `php artisan migrate` if database not set up
- Run: `php artisan db:seed` to create default users

### Frontend Not Starting?
- Make sure you ran `npm install` first
- Check if port 5173 is available
- Verify `VITE_API_URL=http://localhost:8000/api` in `.env` file

### Can't Login?
- Make sure backend is running
- Run: `php artisan db:seed` to create default users
- Check browser console for errors

### API Connection Errors?
- Verify backend is running on port 8000
- Check `frontend/.env` has correct `VITE_API_URL`
- Check CORS settings in Laravel

---

## 📍 Important URLs

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000/api
- **API Docs:** Check `routes/api.php` for all endpoints

---

## 🎯 Quick Test Checklist

- [ ] Backend server running (port 8000)
- [ ] Frontend server running (port 5173)
- [ ] Can access http://localhost:5173
- [ ] Can login as admin
- [ ] Can search routes
- [ ] Can select seats
- [ ] Can complete booking
- [ ] Can view ticket with QR code

---

**Happy Testing! 🎉**

