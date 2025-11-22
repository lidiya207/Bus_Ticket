<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Schedule;
use App\Models\Seat;
use App\Models\SeatLock;
use App\Services\TicketService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class BookingController extends Controller
{
    public function __construct(private readonly TicketService $ticketService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $query = Booking::with(['schedule.travelRoute', 'schedule.bus']);

        if (! $request->user()->hasAnyRole(['admin', 'cashier'])) {
            $query->where('user_id', $request->user()->id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->latest()->paginate(15));
    }

    public function show(Request $request, Booking $booking): JsonResponse
    {
        if (!$request->user()->hasAnyRole(['admin', 'cashier']) && $booking->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($booking->load(['schedule.travelRoute', 'schedule.bus', 'seats']));
    }

    public function showByReference(string $reference): JsonResponse
    {
        $booking = Booking::where('reference', $reference)
            ->with(['schedule.travelRoute', 'schedule.bus', 'seats'])
            ->firstOrFail();

        return response()->json([
            'data' => $booking,
            'qr_code_url' => $booking->qr_code_path,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $booking = $this->handleBookingCreation($request, 'online');

        return response()->json([
            'message' => 'Booking created. Proceed to payment.',
            'data' => $booking->load(['schedule.travelRoute', 'schedule.bus']),
        ], Response::HTTP_CREATED);
    }

    public function storeFromCounter(Request $request): JsonResponse
    {
        $booking = $this->handleBookingCreation($request, 'cashier', true);

        return response()->json([
            'message' => 'Booking created and confirmed for walk-in customer.',
            'data' => $booking->load(['schedule.travelRoute', 'schedule.bus']),
        ], Response::HTTP_CREATED);
    }

    public function confirm(Request $request, Booking $booking): JsonResponse
    {
        if ($booking->status === 'cancelled') {
            return response()->json([
                'message' => 'Cannot confirm a cancelled booking.',
            ], 422);
        }

        if ($booking->status === 'confirmed') {
            return response()->json([
                'message' => 'Booking already confirmed.',
                'data' => $booking,
            ]);
        }

        $booking->update([
            'status' => 'confirmed',
            'payment_status' => 'paid',
        ]);

        $this->ticketService->generateQrCode($booking);

        return response()->json([
            'message' => 'Booking confirmed.',
            'data' => $booking->fresh(),
        ]);
    }

    public function cancel(Request $request, Booking $booking): JsonResponse
    {
        if ($booking->status === 'cancelled') {
            return response()->json([
                'message' => 'Booking already cancelled.',
                'data' => $booking,
            ]);
        }

        $booking->loadMissing('schedule');

        $booking->update([
            'status' => 'cancelled',
            'payment_status' => $booking->payment_status === 'paid' ? 'refunded' : 'unpaid',
        ]);

        $seatCount = count($booking->seats ?? []);
        if ($seatCount > 0) {
            $current = $booking->schedule->booked_seat_count;
            $booking->schedule()->decrement('booked_seat_count', min($seatCount, max($current, 0)));
        }

        return response()->json([
            'message' => 'Booking cancelled.',
            'data' => $booking->fresh(),
        ]);
    }

    protected function handleBookingCreation(Request $request, string $channel, bool $autoConfirm = false): Booking
    {
        $validated = $request->validate([
            'schedule_id' => ['required', 'exists:schedules,id'],
            'seat_labels' => ['required', 'array', 'min:1'],
            'seat_labels.*' => ['string'],
            'customer_name' => ['required', 'string', 'max:120'],
            'customer_phone' => ['required', 'string', 'max:25'],
            'customer_email' => ['nullable', 'email'],
            'lock_token' => [$channel === 'online' ? 'required' : 'nullable', 'string'],
        ]);

        /** @var Schedule $schedule */
        $schedule = Schedule::with('bus')->findOrFail($validated['schedule_id']);

        if ($schedule->status !== 'scheduled') {
            abort(422, 'Schedule is not open for booking.');
        }

        $seatData = Seat::where('bus_id', $schedule->bus_id)
            ->whereIn('label', $validated['seat_labels'])
            ->get()
            ->keyBy('label');

        if ($seatData->count() !== count($validated['seat_labels'])) {
            abort(422, 'One or more seats do not exist on this bus.');
        }

        $bookedSeats = $this->bookedSeatLabels($schedule);
        $conflicts = array_values(array_intersect($bookedSeats, $validated['seat_labels']));

        if (! empty($conflicts)) {
            abort(409, 'Seats already booked: '.implode(', ', $conflicts));
        }

        $locksQuery = SeatLock::where('schedule_id', $schedule->id)
            ->whereIn('seat_label', $validated['seat_labels']);

        if ($locksQuery->exists()) {
            if ($validated['lock_token'] ?? null) {
                $locks = SeatLock::where('lock_token', $validated['lock_token'])
                    ->where('schedule_id', $schedule->id)
                    ->pluck('seat_label')
                    ->toArray();

                sort($locks);
                $seatCheck = $validated['seat_labels'];
                sort($seatCheck);

                if ($locks !== $seatCheck) {
                    abort(409, 'Seat lock mismatch or expired.');
                }
            } elseif (! $request->user()->hasAnyRole(['admin', 'cashier'])) {
                abort(409, 'Seats are currently locked by another user.');
            }
        }

        $farePerSeat = round($schedule->base_fare * $schedule->dynamic_pricing_factor, 2);
        $subtotal = round($farePerSeat * count($validated['seat_labels']), 2);
        $fees = 0;
        $total = $subtotal + $fees;

        $seatPayload = collect($validated['seat_labels'])->map(function ($label) use ($seatData, $farePerSeat) {
            return [
                'label' => $label,
                'seat_class' => $seatData[$label]->seat_class,
                'fare' => $farePerSeat,
            ];
        })->toArray();

        $booking = DB::transaction(function () use ($request, $schedule, $validated, $seatPayload, $subtotal, $fees, $total, $channel, $autoConfirm) {
            $booking = Booking::create([
                'reference' => strtoupper('BT'.Str::random(10)),
                'user_id' => $channel === 'online' ? optional($request->user())->id : null,
                'schedule_id' => $schedule->id,
                'channel' => $channel,
                'customer_name' => $validated['customer_name'],
                'customer_phone' => $validated['customer_phone'],
                'customer_email' => $validated['customer_email'] ?? null,
                'seats' => $seatPayload,
                'subtotal' => $subtotal,
                'fees' => $fees,
                'total_amount' => $total,
                'status' => $autoConfirm ? 'confirmed' : 'pending',
                'payment_status' => $autoConfirm ? 'paid' : 'unpaid',
            ]);

            $schedule->increment('booked_seat_count', count($seatPayload));

            $seatLabels = collect($seatPayload)->pluck('label')->toArray();

            if ($validated['lock_token'] ?? null) {
                SeatLock::where('lock_token', $validated['lock_token'])->delete();
            } else {
                SeatLock::where('schedule_id', $schedule->id)
                    ->whereIn('seat_label', $seatLabels)
                    ->delete();
            }

            if ($autoConfirm) {
                $this->ticketService->generateQrCode($booking);
            }

            return $booking;
        });

        return $booking;
    }

    public function downloadTicket(string $reference): JsonResponse
    {
        $booking = Booking::where('reference', $reference)
            ->with(['schedule.travelRoute', 'schedule.bus'])
            ->firstOrFail();

        if (!$booking->qr_code_path) {
            $this->ticketService->generateQrCode($booking);
        }

        // Return ticket data for frontend to generate PDF
        return response()->json([
            'message' => 'Ticket data ready.',
            'data' => [
                'booking' => $booking->fresh()->load(['schedule.travelRoute', 'schedule.bus']),
                'qr_code_url' => $booking->qr_code_path,
            ],
        ]);
    }

    public function qrCode(Booking $booking): JsonResponse
    {
        if (!$booking->qr_code_path) {
            $this->ticketService->generateQrCode($booking);
        }

        return response()->json([
            'data' => [
                'qr_code_url' => $booking->fresh()->qr_code_path,
                'reference' => $booking->reference,
            ],
        ]);
    }

    public function qrCodeByReference(string $reference): JsonResponse
    {
        $booking = Booking::where('reference', $reference)->firstOrFail();
        return $this->qrCode($booking);
    }

    public function verifyQR(Request $request, string $reference): JsonResponse
    {
        $booking = Booking::where('reference', $reference)
            ->with(['schedule.travelRoute', 'schedule.bus'])
            ->firstOrFail();

        $isValid = $booking->status === 'confirmed' && $booking->payment_status === 'paid';

        return response()->json([
            'valid' => $isValid,
            'booking' => $booking,
            'message' => $isValid ? 'QR code is valid' : 'QR code is invalid or booking not confirmed',
        ]);
    }

    protected function bookedSeatLabels(Schedule $schedule): array
    {
        return Booking::where('schedule_id', $schedule->id)
            ->whereIn('status', ['pending', 'confirmed'])
            ->get()
            ->pluck('seats')
            ->flatMap(fn ($seats) => Arr::wrap($seats))
            ->map(fn ($seat) => is_array($seat) ? ($seat['label'] ?? null) : $seat)
            ->filter()
            ->unique()
            ->values()
            ->toArray();
    }
}
