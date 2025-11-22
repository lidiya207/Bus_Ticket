# XAMPP MySQL Database Setup Guide

## Step 1: Start XAMPP Services
1. Open XAMPP Control Panel
2. Start **Apache** and **MySQL** services
3. Make sure both show green (running)

## Step 2: Create Database
1. Open phpMyAdmin: http://localhost/phpmyadmin
2. Click on "New" in the left sidebar
3. Database name: `busticket`
4. Collation: `utf8mb4_unicode_ci`
5. Click "Create"

## Step 3: Verify Database Configuration
The `.env` file has been updated with these settings:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=busticket
DB_USERNAME=root
DB_PASSWORD=
```

**Note:** If your XAMPP MySQL has a password, update `DB_PASSWORD` in `.env`

## Step 4: Run Migrations and Seeders
Open terminal in the `backend` folder and run:

```bash
# Clear config cache
php artisan config:clear

# Run migrations
php artisan migrate

# Run seeders
php artisan db:seed

# Or run both migrations and seeders
php artisan migrate --seed
```

## Step 5: Test Connection
Run this command to test the database connection:
```bash
php artisan tinker
```
Then type:
```php
DB::connection()->getPdo();
```
If it returns the PDO object, the connection is working!

## Troubleshooting

### Error: "Access denied for user 'root'@'localhost'"
- Check if MySQL has a password in XAMPP
- Update `DB_PASSWORD` in `.env` file

### Error: "Unknown database 'busticket'"
- Make sure you created the database in phpMyAdmin
- Check the database name matches in `.env`

### Error: "Connection refused"
- Make sure MySQL is running in XAMPP
- Check the port (default is 3306)
- Try `127.0.0.1` instead of `localhost`

### Error: "PDOException: could not find driver"
- Install PHP MySQL extension
- In XAMPP, edit `php.ini` and uncomment:
  ```
  extension=pdo_mysql
  extension=mysqli
  ```
- Restart Apache

