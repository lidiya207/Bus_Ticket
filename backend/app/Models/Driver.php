<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Driver extends Model
{
    use HasFactory;

    protected $fillable = [
        'first_name',
        'last_name',
        'phone',
        'license_number',
        'experience_years',
        'status',
        'photo_url',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class);
    }

    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }
}
