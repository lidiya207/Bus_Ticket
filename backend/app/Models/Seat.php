<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Seat extends Model
{
    use HasFactory;

    protected $fillable = [
        'bus_id',
        'label',
        'seat_class',
        'status',
        'is_window',
    ];

    protected $casts = [
        'is_window' => 'boolean',
    ];

    public function bus(): BelongsTo
    {
        return $this->belongsTo(Bus::class);
    }
}
