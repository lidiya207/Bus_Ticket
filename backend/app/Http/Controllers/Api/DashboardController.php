<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Bus;
use App\Models\Schedule;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function kpis(): JsonResponse
    {
        $totalRevenue = Booking::where('payment_status', 'paid')->sum('total_amount');
        $todayRevenue = Booking::where('payment_status', 'paid')
            ->whereDate('created_at', Carbon::today())
            ->sum('total_amount');
        $totalBookings = Booking::count();
        $activeBuses = Bus::where('status', 'active')->count();
        $upcomingSchedules = Schedule::where('departure_time', '>=', now())->count();

        return response()->json([
            'total_revenue' => $totalRevenue,
            'today_revenue' => $todayRevenue,
            'total_bookings' => $totalBookings,
            'active_buses' => $activeBuses,
            'upcoming_schedules' => $upcomingSchedules,
        ]);
    }

    public function revenue(Request $request): JsonResponse
    {
        $range = $request->get('range', 'monthly');

        $bucketExpression = $this->groupExpression($range);

        $query = Booking::select([
            DB::raw("{$bucketExpression} as bucket"),
            DB::raw('SUM(total_amount) as total'),
        ])
            ->where('payment_status', 'paid')
            ->groupBy('bucket')
            ->orderBy('bucket');

        return response()->json([
            'range' => $range,
            'data' => $query->get(),
        ]);
    }

    public function utilization(): JsonResponse
    {
        $data = Schedule::select([
            'buses.code as bus_code',
            'buses.capacity',
            DB::raw('SUM(booked_seat_count) as seats_booked'),
        ])
            ->join('buses', 'schedules.bus_id', '=', 'buses.id')
            ->whereBetween('departure_time', [Carbon::now()->subMonth(), Carbon::now()->addMonth()])
            ->groupBy('buses.code', 'buses.capacity')
            ->get()
            ->map(function ($row) {
                $utilization = $row->capacity ? round(($row->seats_booked / ($row->capacity)) * 100, 1) : 0;
                return [
                    'bus_code' => $row->bus_code,
                    'capacity' => $row->capacity,
                    'seats_booked' => $row->seats_booked,
                    'utilization_percent' => min($utilization, 100),
                ];
            });

        return response()->json($data);
    }

    protected function groupExpression(string $range): string
    {
        return match ($range) {
            'daily' => "DATE_FORMAT(created_at, '%Y-%m-%d')",
            'weekly' => "DATE_FORMAT(created_at, '%x-W%v')",
            default => "DATE_FORMAT(created_at, '%Y-%m')",
        };
    }
}
