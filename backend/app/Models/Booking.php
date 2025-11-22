<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'reference',
        'user_id',
        'schedule_id',
        'channel',
        'customer_name',
        'customer_phone',
        'customer_email',
        'seats',
        'subtotal',
        'fees',
        'total_amount',
        'status',
        'payment_status',
        'checked_in_at',
        'qr_code_path',
        'metadata',
    ];

    protected $casts = [
        'seats' => 'array',
        'metadata' => 'array',
        'subtotal' => 'decimal:2',
        'fees' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'checked_in_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function schedule(): BelongsTo
    {
        return $this->belongsTo(Schedule::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }
}
