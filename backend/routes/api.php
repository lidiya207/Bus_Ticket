<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\BusController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DriverController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\SeatController;
use App\Http\Controllers\Api\TravelRouteController;
use App\Http\Controllers\Api\BusLocationController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('reset-password', [AuthController::class, 'resetPassword']);
});

// Public discovery endpoints
Route::get('routes', [TravelRouteController::class, 'index']);
Route::get('routes/search', [TravelRouteController::class, 'search']);
Route::get('routes/cities', [TravelRouteController::class, 'cities']);
Route::get('routes/{route}/schedules', [ScheduleController::class, 'byRoute']);
Route::get('schedules', [ScheduleController::class, 'index']);
Route::get('schedules/search', [ScheduleController::class, 'search']);
Route::get('schedules/{schedule}', [ScheduleController::class, 'show']);
Route::get('schedules/{schedule}/seats', [SeatController::class, 'availability']);
Route::get('bookings/reference/{reference}', [BookingController::class, 'showByReference']);
Route::get('buses/types', [BusController::class, 'types']);

Route::middleware('auth:api')->group(function () {
    Route::get('auth/me', [AuthController::class, 'me']);
    Route::get('auth/profile', [AuthController::class, 'profile']);
    Route::post('auth/logout', [AuthController::class, 'logout']);

    Route::post('schedules/{schedule}/locks', [SeatController::class, 'lock']);
    Route::delete('seat-locks/{lockToken}', [SeatController::class, 'release']);

    Route::post('bookings', [BookingController::class, 'store']);
    Route::get('bookings', [BookingController::class, 'index']);
    Route::get('bookings/{booking}', [BookingController::class, 'show']);
    Route::post('bookings/{booking}/confirm', [BookingController::class, 'confirm']);
    Route::post('bookings/{booking}/cancel', [BookingController::class, 'cancel']);
    Route::put('bookings/{booking}/status', [BookingController::class, 'updateStatus']);
    Route::get('bookings/reference/{reference}/verify', [BookingController::class, 'verifyQR']);

    Route::post('bookings/{booking}/payments/initiate', [PaymentController::class, 'initiate']);
    Route::post('bookings/{booking}/payments/webhook', [PaymentController::class, 'webhook']);

    Route::get('dashboard/kpis', [DashboardController::class, 'kpis'])
        ->middleware('role:admin');
    Route::get('dashboard/stats', [DashboardController::class, 'stats'])
        ->middleware('role:admin');
    Route::get('dashboard/cashier-stats', [DashboardController::class, 'cashierStats'])
        ->middleware('role:cashier,admin');
    Route::get('dashboard/revenue', [DashboardController::class, 'revenue'])
        ->middleware('role:admin,cashier');
    Route::get('dashboard/utilization', [DashboardController::class, 'utilization'])
        ->middleware('role:admin');

    Route::apiResource('buses', BusController::class)->middleware('role:admin');
    Route::apiResource('routes', TravelRouteController::class)
        ->middleware('role:admin');
    Route::apiResource('drivers', DriverController::class)->middleware('role:admin');
    Route::apiResource('schedules', ScheduleController::class)->middleware('role:admin,cashier');
    
    Route::get('users', [AuthController::class, 'index'])->middleware('role:admin,cashier');
    Route::post('users', [AuthController::class, 'createUser'])->middleware('role:admin,cashier');
    Route::delete('users/{user}', [AuthController::class, 'destroy'])->middleware('role:admin');

    Route::get('cashier/seats/{schedule}', [SeatController::class, 'availability'])
        ->middleware('role:cashier,admin');
    Route::post('cashier/bookings', [BookingController::class, 'storeFromCounter'])
        ->middleware('role:cashier,admin');
    
    Route::get('buses/{bus}/location', [BusLocationController::class, 'show']);
    Route::get('buses/{bus}/track', [BusLocationController::class, 'track']);
    Route::post('buses/{bus}/location', [BusLocationController::class, 'update'])
        ->middleware('role:admin');
    
    Route::get('bookings/reference/{reference}/download', [BookingController::class, 'downloadTicket']);
    Route::get('bookings/reference/{reference}/qr', [BookingController::class, 'qrCodeByReference']);
    Route::get('bookings/{booking}', [BookingController::class, 'show']);
    Route::post('seats/{seat}/lock', [SeatController::class, 'lockSeat']);
    Route::delete('seats/{seat}/lock', [SeatController::class, 'releaseSeat']);
});

