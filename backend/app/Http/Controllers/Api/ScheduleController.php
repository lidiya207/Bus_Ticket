<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Models\TravelRoute;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Schedule::with(['bus', 'travelRoute', 'driver']);

        if ($request->filled('route_id')) {
            $query->where('travel_route_id', $request->route_id);
        }

        if ($request->filled('date')) {
            $date = Carbon::parse($request->date);
            $query->whereBetween('departure_time', [$date->startOfDay(), $date->endOfDay()]);
        }

        return response()->json($query->orderBy('departure_time')->paginate(20));
    }

    public function byRoute(TravelRoute $route): JsonResponse
    {
        $schedules = $route->schedules()
            ->with(['bus', 'driver'])
            ->where('departure_time', '>=', now())
            ->orderBy('departure_time')
            ->get();

        return response()->json(['data' => $schedules]);
    }

    public function show(Schedule $schedule): JsonResponse
    {
        return response()->json($schedule->load(['bus.seats', 'driver', 'travelRoute']));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);
        $schedule = Schedule::create($data);

        return response()->json([
            'message' => 'Schedule created.',
            'data' => $schedule->load(['bus', 'travelRoute', 'driver']),
        ], 201);
    }

    public function update(Request $request, Schedule $schedule): JsonResponse
    {
        $data = $this->validated($request);
        $schedule->update($data);

        return response()->json([
            'message' => 'Schedule updated.',
            'data' => $schedule->fresh()->load(['bus', 'travelRoute', 'driver']),
        ]);
    }

    public function destroy(Schedule $schedule): JsonResponse
    {
        $schedule->delete();

        return response()->json([
            'message' => 'Schedule removed.',
        ]);
    }

    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'from' => ['required', 'string'],
            'to' => ['required', 'string'],
            'date' => ['required', 'date'],
        ]);

        $date = Carbon::parse($request->input('date'))->startOfDay();

        $schedules = Schedule::with(['bus', 'travelRoute', 'driver'])
            ->whereHas('travelRoute', function ($query) use ($request) {
                $query->where('origin_city', 'like', '%' . $request->from . '%')
                    ->where('destination_city', 'like', '%' . $request->to . '%')
                    ->where('status', 'active');
            })
            ->whereBetween('departure_time', [$date, (clone $date)->endOfDay()])
            ->where('status', 'scheduled')
            ->where('departure_time', '>=', now())
            ->orderBy('departure_time')
            ->get();

        // Format the response with additional data
        $formattedSchedules = $schedules->map(function ($schedule) {
            $bus = $schedule->bus;
            $totalSeats = $bus ? $bus->seats()->count() : 0;
            $bookedSeats = $schedule->booked_seat_count ?? 0;
            $availableSeats = $totalSeats - $bookedSeats;

            return [
                'id' => $schedule->id,
                'bus' => $schedule->bus ? [
                    'id' => $schedule->bus->id,
                    'name' => $schedule->bus->name ?? $schedule->bus->code,
                    'type' => $schedule->bus->type,
                    'amenities' => $schedule->bus->amenities ?? [],
                ] : null,
                'travel_route' => $schedule->travelRoute ? [
                    'id' => $schedule->travelRoute->id,
                    'from' => $schedule->travelRoute->origin_city,
                    'to' => $schedule->travelRoute->destination_city,
                    'distance_km' => $schedule->travelRoute->distance_km,
                    'duration_minutes' => $schedule->travelRoute->duration_minutes,
                ] : null,
                'departure_time' => $schedule->departure_time,
                'arrival_time' => $schedule->arrival_time,
                'boarding_point' => $schedule->boarding_point,
                'dropoff_point' => $schedule->dropoff_point,
                'price' => $schedule->base_fare * ($schedule->dynamic_pricing_factor ?? 1),
                'base_fare' => $schedule->base_fare,
                'available_seats' => max(0, $availableSeats),
                'total_seats' => $totalSeats,
                'driver' => $schedule->driver ? [
                    'name' => $schedule->driver->first_name . ' ' . $schedule->driver->last_name,
                ] : null,
            ];
        });

        return response()->json([
            'data' => $formattedSchedules,
        ]);
    }

    protected function validated(Request $request): array
    {
        return $request->validate([
            'bus_id' => ['required', 'exists:buses,id'],
            'travel_route_id' => ['required', 'exists:travel_routes,id'],
            'driver_id' => ['nullable', 'exists:drivers,id'],
            'departure_time' => ['required', 'date'],
            'arrival_time' => ['nullable', 'date', 'after:departure_time'],
            'boarding_point' => ['nullable', 'string'],
            'dropoff_point' => ['nullable', 'string'],
            'base_fare' => ['required', 'numeric', 'min:0'],
            'dynamic_pricing_factor' => ['nullable', 'numeric', 'min:0.5', 'max:2'],
            'status' => ['nullable', 'in:scheduled,boarding,ongoing,completed,cancelled'],
        ]);
    }
}
