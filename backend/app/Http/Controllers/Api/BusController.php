<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bus;
use App\Models\Seat;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class BusController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Bus::withCount('schedules')->paginate(15));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);

        $bus = DB::transaction(function () use ($data) {
            $bus = Bus::create($data);

            if (! empty($data['seat_map'])) {
                $this->syncSeats($bus, $data['seat_map']);
            }

            return $bus->load('seats');
        });

        return response()->json([
            'message' => 'Bus created successfully.',
            'data' => $bus,
        ], 201);
    }

    public function show(Bus $bus): JsonResponse
    {
        return response()->json($bus->load('seats'));
    }

    public function update(Request $request, Bus $bus): JsonResponse
    {
        $data = $this->validated($request, $bus->id);

        DB::transaction(function () use ($bus, $data) {
            $bus->update($data);

            if (array_key_exists('seat_map', $data)) {
                $this->syncSeats($bus, $data['seat_map'] ?? []);
            }
        });

        return response()->json([
            'message' => 'Bus updated successfully.',
            'data' => $bus->fresh()->load('seats'),
        ]);
    }

    public function destroy(Bus $bus): JsonResponse
    {
        $bus->delete();

        return response()->json([
            'message' => 'Bus removed successfully.',
        ]);
    }

    public function types(): JsonResponse
    {
        $types = Bus::where('status', 'active')
            ->distinct()
            ->pluck('type')
            ->filter()
            ->map(function ($type) {
                return [
                    'type' => $type,
                    'label' => ucfirst($type),
                ];
            })
            ->values();

        return response()->json([
            'data' => $types,
        ]);
    }

    protected function syncSeats(Bus $bus, array $seatMap): void
    {
        $bus->seats()->delete();
        foreach ($seatMap as $seat) {
            Seat::create([
                'bus_id' => $bus->id,
                'label' => $seat['label'],
                'seat_class' => $seat['seat_class'] ?? 'standard',
                'status' => $seat['status'] ?? 'available',
                'is_window' => $seat['is_window'] ?? false,
            ]);
        }
    }

    protected function validated(Request $request, ?int $id = null): array
    {
        $presence = $id ? 'sometimes' : 'required';

        return $request->validate([
            'code' => [
                $presence,
                'string',
                'max:20',
                Rule::unique('buses', 'code')->ignore($id),
            ],
            'plate_number' => [
                $presence,
                'string',
                'max:20',
                Rule::unique('buses', 'plate_number')->ignore($id),
            ],
            'capacity' => [$presence, 'integer', 'min:10', 'max:80'],
            'type' => [$presence, 'in:standard,vip,mini,sleeper'],
            'amenities' => ['nullable', 'array'],
            'amenities.*' => ['string', 'max:50'],
            'status' => ['nullable', 'in:active,maintenance,inactive'],
            'seat_map' => ['nullable', 'array'],
            'seat_map.*.label' => ['required_with:seat_map', 'string', 'max:10'],
            'seat_map.*.seat_class' => ['nullable', 'in:standard,vip,accessible'],
            'seat_map.*.status' => ['nullable', 'in:available,maintenance,blocked'],
            'seat_map.*.is_window' => ['nullable', 'boolean'],
        ]);
    }
}
