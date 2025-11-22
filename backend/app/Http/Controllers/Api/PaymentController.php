<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use App\Services\TicketService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    public function __construct(private readonly TicketService $ticketService)
    {
    }

    public function initiate(Request $request, Booking $booking): JsonResponse
    {
        if (! $request->user()->hasAnyRole(['admin', 'cashier']) && $booking->user_id !== $request->user()->id) {
            abort(403, 'Not authorized to pay for this booking.');
        }

        if ($booking->payment_status === 'paid') {
            return response()->json([
                'message' => 'Booking already paid.',
            ], 422);
        }

        $transactionReference = strtoupper('TB'.Str::random(12));

        $payment = Payment::create([
            'booking_id' => $booking->id,
            'provider' => 'telebirr',
            'transaction_reference' => $transactionReference,
            'amount' => $booking->total_amount,
            'status' => 'initiated',
            'payload' => [
                'phone' => $request->user()->phone ?? $booking->customer_phone,
            ],
        ]);

        return response()->json([
            'message' => 'Telebirr payment initiated.',
            'data' => [
                'payment' => $payment,
                'checkout_token' => Str::random(6),
                'instructions' => 'Use Telebirr app to approve this mock transaction.',
            ],
        ], 201);
    }

    public function webhook(Request $request, Booking $booking): JsonResponse
    {
        $data = $request->validate([
            'transaction_reference' => ['required', 'string'],
            'status' => ['required', 'in:successful,failed'],
            'payload' => ['nullable', 'array'],
        ]);

        $payment = Payment::where('booking_id', $booking->id)
            ->where('transaction_reference', $data['transaction_reference'])
            ->firstOrFail();

        DB::transaction(function () use ($booking, $payment, $data) {
            $payment->update([
                'status' => $data['status'],
                'payload' => $data['payload'] ?? $payment->payload,
                'paid_at' => $data['status'] === 'successful' ? now() : null,
            ]);

            if ($data['status'] === 'successful') {
                $booking->update([
                    'status' => 'confirmed',
                    'payment_status' => 'paid',
                ]);
                $this->ticketService->generateQrCode($booking);
            } else {
                $booking->update([
                    'payment_status' => 'unpaid',
                ]);
            }
        });

        return response()->json([
            'message' => 'Payment status updated.',
            'data' => [
                'payment' => $payment->fresh(),
                'booking' => $booking->fresh(),
            ],
        ]);
    }
}
