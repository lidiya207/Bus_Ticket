<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Models\TravelRoute;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TravelRouteController extends Controller
{
    public function index(): JsonResponse
    {
        $routes = TravelRoute::withCount('schedules')
            ->where('status', 'active')
            ->orderBy('origin_city')
            ->paginate(20);

        return response()->json($routes);
    }

    public function show(TravelRoute $travel_route): JsonResponse
    {
        return response()->json($travel_route->load('schedules'));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);
        $route = TravelRoute::create($data);

        return response()->json([
            'message' => 'Route created successfully.',
            'data' => $route,
        ], 201);
    }

    public function update(Request $request, TravelRoute $travel_route): JsonResponse
    {
        $data = $this->validated($request, $travel_route->id);
        $travel_route->update($data);

        return response()->json([
            'message' => 'Route updated successfully.',
            'data' => $travel_route->fresh(),
        ]);
    }

    public function destroy(TravelRoute $travel_route): JsonResponse
    {
        $travel_route->delete();

        return response()->json([
            'message' => 'Route deleted successfully.',
        ]);
    }

    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'origin' => ['required', 'string'],
            'destination' => ['required', 'string'],
            'date' => ['required', 'date'],
        ]);

        $date = Carbon::parse($request->input('date'))->startOfDay();

        $schedules = Schedule::with(['bus', 'travelRoute'])
            ->whereHas('travelRoute', function ($query) use ($request) {
                $query->where('origin_city', 'like', '%'.$request->origin.'%')
                    ->where('destination_city', 'like', '%'.$request->destination.'%')
                    ->where('status', 'active');
            })
            ->whereBetween('departure_time', [$date, (clone $date)->endOfDay()])
            ->where('status', 'scheduled')
            ->where('departure_time', '>=', now())
            ->orderBy('departure_time')
            ->get();

        return response()->json([
            'data' => $schedules,
        ]);
    }

    public function cities(): JsonResponse
    {
        $originCities = TravelRoute::where('status', 'active')
            ->distinct()
            ->pluck('origin_city')
            ->sort()
            ->values();

        $destinationCities = TravelRoute::where('status', 'active')
            ->distinct()
            ->pluck('destination_city')
            ->sort()
            ->values();

        return response()->json([
            'data' => [
                'origins' => $originCities,
                'destinations' => $destinationCities,
                'all' => $originCities->merge($destinationCities)->unique()->sort()->values(),
            ],
        ]);
    }

    protected function validated(Request $request, ?int $id = null): array
    {
        return $request->validate([
            'code' => [
                'required',
                'string',
                'max:30',
                Rule::unique('travel_routes', 'code')->ignore($id),
            ],
            'origin_city' => ['required', 'string', 'max:120'],
            'destination_city' => ['required', 'string', 'max:120'],
            'distance_km' => ['nullable', 'integer'],
            'duration_minutes' => ['nullable', 'integer'],
            'base_price' => ['required', 'numeric', 'min:0'],
            'status' => ['nullable', 'in:active,inactive'],
            'description' => ['nullable', 'string'],
        ]);
    }
}
