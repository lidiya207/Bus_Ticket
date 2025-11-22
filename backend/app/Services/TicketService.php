<?php

namespace App\Services;

use App\Models\Booking;
use Illuminate\Support\Facades\Storage;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class TicketService
{
    public function generateQrCode(Booking $booking): string
    {
        $fileName = 'qr/'.strtolower($booking->reference).'.png';

        Storage::disk('public')->put(
            $fileName,
            QrCode::format('png')->size(300)->generate($booking->reference)
        );

        $url = Storage::disk('public')->url($fileName);

        $booking->update([
            'qr_code_path' => $url,
        ]);

        return $url;
    }
}

