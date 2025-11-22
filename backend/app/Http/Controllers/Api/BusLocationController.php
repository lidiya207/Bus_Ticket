<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bus;
use App\Models\BusLocation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BusLocationController extends Controller
{
    public function update(Request $request, Bus $bus): JsonResponse
    {
        $data = $request->validate([
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'speed' => ['nullable', 'numeric', 'min:0'],
            'heading' => ['nullable', 'numeric', 'between:0,360'],
        ]);

        $location = BusLocation::updateOrCreate(
            ['bus_id' => $bus->id],
            array_merge($data, ['recorded_at' => now()])
        );

        return response()->json([
            'message' => 'Location updated.',
            'data' => $location,
        ]);
    }

    public function show(Bus $bus): JsonResponse
    {
        $location = BusLocation::where('bus_id', $bus->id)
            ->latest('recorded_at')
            ->first();

        return response()->json($location ?? [
            'message' => 'No location data available.',
            'data' => null,
        ]);
    }

    public function track(Bus $bus): JsonResponse
    {
        $locations = BusLocation::where('bus_id', $bus->id)
            ->orderBy('recorded_at', 'desc')
            ->limit(50)
            ->get();

        return response()->json($locations);
    }
}
