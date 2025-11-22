# How to Start the Backend Server

## Quick Start

1. **Open a new terminal/command prompt**

2. **Navigate to the backend folder:**
   ```bash
   cd "C:\Users\Lidiya Getale\Desktop\Bus_Ticket\backend"
   ```

3. **Start the Laravel server:**
   ```bash
   php artisan serve
   ```

4. **You should see:**
   ```
   INFO  Server running on [http://127.0.0.1:8000]
   ```

5. **Keep this terminal open** - the server must stay running!

## Verify It's Working

Open your browser and go to:
- http://localhost:8000/api/routes/cities

You should see JSON data with cities.

## Frontend Configuration

Make sure your frontend `.env` or `api.js` has:
```
VITE_API_URL=http://localhost:8000/api
```

Or the default in `api.js` should work: `http://localhost:8000/api`

## Troubleshooting

### Port 8000 already in use?
```bash
php artisan serve --port=8001
```
Then update frontend API URL to `http://localhost:8001/api`

### CORS Error?
The backend should handle CORS automatically. If you see CORS errors, check:
- Backend server is running
- Frontend is calling the correct URL
- Both are on localhost (same origin)

### Route Not Found?
- Make sure backend server is running
- Check the URL in browser: http://localhost:8000/api/schedules/search?from=Addis%20Ababa&to=Hawassa&date=2025-11-23
- Verify route exists: `php artisan route:list --path=schedules/search`

