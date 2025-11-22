<?php

return [
    'lock_ttl' => env('BOOKING_LOCK_TTL', 120),
    'qr_path' => storage_path('app/public/qr'),
    'ticket_path' => storage_path('app/public/tickets'),
];

