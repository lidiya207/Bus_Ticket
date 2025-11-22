<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Schedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'bus_id',
        'travel_route_id',
        'driver_id',
        'departure_time',
        'arrival_time',
        'boarding_point',
        'dropoff_point',
        'base_fare',
        'dynamic_pricing_factor',
        'status',
        'booked_seat_count',
    ];

    protected $casts = [
        'departure_time' => 'datetime',
        'arrival_time' => 'datetime',
        'base_fare' => 'decimal:2',
        'dynamic_pricing_factor' => 'float',
    ];

    public function bus(): BelongsTo
    {
        return $this->belongsTo(Bus::class);
    }

    public function travelRoute(): BelongsTo
    {
        return $this->belongsTo(TravelRoute::class);
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(Driver::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function seatLocks(): HasMany
    {
        return $this->hasMany(SeatLock::class);
    }

    public function locations(): HasMany
    {
        return $this->hasMany(BusLocation::class);
    }
}
