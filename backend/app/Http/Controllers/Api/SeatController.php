<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Schedule;
use App\Models\Seat;
use App\Models\SeatLock;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SeatController extends Controller
{
    public function availability(Schedule $schedule): JsonResponse
    {
        if ($schedule->status === 'cancelled') {
            return response()->json([
                'message' => 'Schedule is cancelled.',
                'seats' => [],
            ], 410);
        }

        $this->purgeExpiredLocks($schedule);

        $seats = Seat::where('bus_id', $schedule->bus_id)->get();
        $locked = SeatLock::where('schedule_id', $schedule->id)->get()->keyBy('seat_label');
        $bookedSeats = $this->bookedSeatLabels($schedule);

        $payload = $seats->map(function (Seat $seat) use ($locked, $bookedSeats) {
            $lock = $locked->get($seat->label);
            $isBooked = in_array($seat->label, $bookedSeats, true);

            return [
                'label' => $seat->label,
                'seat_class' => $seat->seat_class,
                'is_window' => (bool) $seat->is_window,
                'status' => $isBooked ? 'booked' : ($lock ? 'locked' : $seat->status),
                'locked_until' => $lock ? $lock->locked_until : null,
            ];
        });

        return response()->json([
            'schedule_id' => $schedule->id,
            'seats' => $payload,
        ]);
    }

    public function lock(Request $request, Schedule $schedule): JsonResponse
    {
        if ($schedule->status !== 'scheduled') {
            return response()->json([
                'message' => 'Seat locking is only allowed on scheduled trips.',
            ], 422);
        }

        $data = $request->validate([
            'seat_labels' => ['required', 'array', 'min:1'],
            'seat_labels.*' => ['string'],
        ]);

        $this->purgeExpiredLocks($schedule);

        $validSeats = Seat::where('bus_id', $schedule->bus_id)
            ->whereIn('label', $data['seat_labels'])
            ->pluck('label')
            ->toArray();

        if (count($validSeats) !== count($data['seat_labels'])) {
            return response()->json([
                'message' => 'One or more seats are invalid for this bus.',
            ], 422);
        }

        $unavailable = Seat::where('bus_id', $schedule->bus_id)
            ->whereIn('label', $data['seat_labels'])
            ->where('status', '!=', 'available')
            ->pluck('label')
            ->toArray();

        if (! empty($unavailable)) {
            return response()->json([
                'message' => 'Some seats are not available for booking.',
                'conflicts' => $unavailable,
            ], 422);
        }

        $bookedSeats = $this->bookedSeatLabels($schedule);
        $lockedSeats = SeatLock::where('schedule_id', $schedule->id)
            ->whereIn('seat_label', $data['seat_labels'])
            ->pluck('seat_label')
            ->toArray();

        $conflicts = array_unique(array_merge(
            array_values(array_intersect($bookedSeats, $data['seat_labels'])),
            $lockedSeats
        ));

        if (! empty($conflicts)) {
            return response()->json([
                'message' => 'Some seats are already taken.',
                'conflicts' => $conflicts,
            ], 409);
        }

        $lockToken = Str::uuid()->toString();
        $ttl = (int) config('booking.lock_ttl', env('BOOKING_LOCK_TTL', 120));
        $lockedUntil = now()->addSeconds(max($ttl, 30));

        DB::transaction(function () use ($schedule, $data, $lockToken, $lockedUntil, $request) {
            foreach ($data['seat_labels'] as $label) {
                SeatLock::create([
                    'schedule_id' => $schedule->id,
                    'seat_label' => $label,
                    'lock_token' => $lockToken,
                    'user_id' => $request->user()?->id,
                    'locked_until' => $lockedUntil,
                ]);
            }
        });

        return response()->json([
            'message' => 'Seats locked successfully.',
            'lock_token' => $lockToken,
            'locked_until' => $lockedUntil,
        ], 201);
    }

    public function release(Request $request, string $lockToken): JsonResponse
    {
        $lock = SeatLock::where('lock_token', $lockToken)->first();
        if (! $lock) {
            return response()->json([
                'message' => 'Lock token not found or already released.',
            ], 404);
        }

        if ($lock->user_id && $request->user() &&
            $request->user()->id !== $lock->user_id &&
            ! $request->user()->hasAnyRole(['admin', 'cashier'])) {
            return response()->json([
                'message' => 'You are not allowed to release this lock.',
            ], 403);
        }

        SeatLock::where('lock_token', $lockToken)->delete();

        return response()->json([
            'message' => 'Seat lock released.',
        ]);
    }

    protected function purgeExpiredLocks(Schedule $schedule): void
    {
        SeatLock::where('schedule_id', $schedule->id)
            ->where('locked_until', '<', Carbon::now())
            ->delete();
    }

    protected function bookedSeatLabels(Schedule $schedule): array
    {
        return Booking::where('schedule_id', $schedule->id)
            ->whereIn('status', ['pending', 'confirmed'])
            ->get()
            ->pluck('seats')
            ->flatMap(fn ($seats) => Arr::wrap($seats))
            ->flatten()
            ->map(fn ($seat) => is_array($seat) ? ($seat['label'] ?? null) : $seat)
            ->filter()
            ->unique()
            ->values()
            ->toArray();
    }
}
