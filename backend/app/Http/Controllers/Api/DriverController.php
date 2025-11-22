<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Driver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DriverController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Driver::paginate(20));
    }

    public function store(Request $request): JsonResponse
    {
        $driver = Driver::create($this->validated($request));

        return response()->json([
            'message' => 'Driver created.',
            'data' => $driver,
        ], 201);
    }

    public function show(Driver $driver): JsonResponse
    {
        return response()->json($driver->load('schedules'));
    }

    public function update(Request $request, Driver $driver): JsonResponse
    {
        $driver->update($this->validated($request, $driver->id));

        return response()->json([
            'message' => 'Driver updated.',
            'data' => $driver->fresh(),
        ]);
    }

    public function destroy(Driver $driver): JsonResponse
    {
        $driver->delete();

        return response()->json([
            'message' => 'Driver removed.',
        ]);
    }

    protected function validated(Request $request, ?int $id = null): array
    {
        return $request->validate([
            'first_name' => ['required', 'string', 'max:60'],
            'last_name' => ['required', 'string', 'max:60'],
            'phone' => [
                'required',
                'string',
                'max:20',
                Rule::unique('drivers', 'phone')->ignore($id),
            ],
            'license_number' => [
                'required',
                'string',
                'max:50',
                Rule::unique('drivers', 'license_number')->ignore($id),
            ],
            'experience_years' => ['nullable', 'integer', 'min:0', 'max:50'],
            'status' => ['nullable', 'in:active,inactive,suspended'],
            'photo_url' => ['nullable', 'url'],
            'metadata' => ['nullable', 'array'],
        ]);
    }
}
