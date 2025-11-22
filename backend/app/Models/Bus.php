<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Bus extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'plate_number',
        'capacity',
        'type',
        'amenities',
        'status',
        'last_maintenance_at',
    ];

    protected $casts = [
        'amenities' => 'array',
        'last_maintenance_at' => 'datetime',
    ];

    public function seats(): HasMany
    {
        return $this->hasMany(Seat::class);
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class);
    }
}
