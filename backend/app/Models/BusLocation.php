<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BusLocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'schedule_id',
        'latitude',
        'longitude',
        'speed_kmh',
        'status',
        'recorded_at',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'recorded_at' => 'datetime',
    ];

    public function schedule(): BelongsTo
    {
        return $this->belongsTo(Schedule::class);
    }
}
