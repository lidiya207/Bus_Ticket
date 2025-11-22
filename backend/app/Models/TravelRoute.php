<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TravelRoute extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'origin_city',
        'destination_city',
        'distance_km',
        'duration_minutes',
        'base_price',
        'status',
        'description',
    ];

    protected $casts = [
        'distance_km' => 'integer',
        'duration_minutes' => 'integer',
        'base_price' => 'decimal:2',
    ];

    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class);
    }
}
