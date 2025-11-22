<?php

namespace Database\Seeders;

use App\Models\Bus;
use App\Models\Driver;
use App\Models\Schedule;
use App\Models\Seat;
use App\Models\TravelRoute;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TestDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::transaction(function () {
            // Create additional drivers
            $drivers = [];
            for ($i = 2; $i <= 5; $i++) {
                $drivers[] = Driver::firstOrCreate(
                    ['phone' => '091199999' . $i],
                    [
                        'first_name' => 'Driver',
                        'last_name' => 'Name' . $i,
                        'license_number' => 'DRV-00' . $i,
                        'experience_years' => rand(3, 15),
                        'status' => 'active',
                    ]
                );
            }

            // Create additional buses
            $buses = [];
            $busTypes = ['vip', 'standard', 'luxury'];
            for ($i = 2; $i <= 6; $i++) {
                $bus = Bus::firstOrCreate(
                    ['code' => 'BUS-00' . $i],
                    [
                        'plate_number' => 'AA-' . str_pad($i, 5, '0', STR_PAD_LEFT),
                        'capacity' => rand(30, 50),
                        'type' => $busTypes[array_rand($busTypes)],
                        'amenities' => ['AC', 'WiFi', 'Charger', 'TV'],
                        'status' => 'active',
                    ]
                );

                // Create seats for new buses
                if ($bus->wasRecentlyCreated) {
                    $seatLabels = collect(range(1, $bus->capacity))->map(function ($number) {
                        $row = (int) ceil($number / 4);
                        $seatLetter = chr(64 + (($number - 1) % 4) + 1);
                        return sprintf('%02d%s', $row, $seatLetter);
                    });

                    foreach ($seatLabels as $index => $label) {
                        Seat::create([
                            'bus_id' => $bus->id,
                            'label' => $label,
                            'seat_class' => $index < 8 ? 'vip' : 'standard',
                            'is_window' => in_array(substr($label, -1), ['A', 'D']),
                        ]);
                    }
                }

                $buses[] = $bus;
            }

            // Get existing bus and driver
            $existingBus = Bus::where('code', 'BUS-001')->first();
            $existingDriver = Driver::where('license_number', 'DRV-001')->first();
            if ($existingBus) {
                $buses[] = $existingBus;
            }
            if ($existingDriver) {
                $drivers[] = $existingDriver;
            }

            // Create multiple routes (popular Ethiopian cities)
            $routes = [
                [
                    'code' => 'RT-ADD-BHR',
                    'origin_city' => 'Addis Ababa',
                    'destination_city' => 'Bahir Dar',
                    'distance_km' => 578,
                    'duration_minutes' => 600,
                    'base_price' => 850,
                ],
                [
                    'code' => 'RT-ADD-MK',
                    'origin_city' => 'Addis Ababa',
                    'destination_city' => 'Mekelle',
                    'distance_km' => 783,
                    'duration_minutes' => 720,
                    'base_price' => 1200,
                ],
                [
                    'code' => 'RT-ADD-GD',
                    'origin_city' => 'Addis Ababa',
                    'destination_city' => 'Gondar',
                    'distance_km' => 748,
                    'duration_minutes' => 660,
                    'base_price' => 1100,
                ],
                [
                    'code' => 'RT-ADD-DB',
                    'origin_city' => 'Addis Ababa',
                    'destination_city' => 'Dire Dawa',
                    'distance_km' => 515,
                    'duration_minutes' => 480,
                    'base_price' => 750,
                ],
                [
                    'code' => 'RT-ADD-JM',
                    'origin_city' => 'Addis Ababa',
                    'destination_city' => 'Jimma',
                    'distance_km' => 346,
                    'duration_minutes' => 360,
                    'base_price' => 550,
                ],
                [
                    'code' => 'RT-HRW-ADD',
                    'origin_city' => 'Hawassa',
                    'destination_city' => 'Addis Ababa',
                    'distance_km' => 275,
                    'duration_minutes' => 300,
                    'base_price' => 650,
                ],
                [
                    'code' => 'RT-BHR-ADD',
                    'origin_city' => 'Bahir Dar',
                    'destination_city' => 'Addis Ababa',
                    'distance_km' => 578,
                    'duration_minutes' => 600,
                    'base_price' => 850,
                ],
                [
                    'code' => 'RT-MK-ADD',
                    'origin_city' => 'Mekelle',
                    'destination_city' => 'Addis Ababa',
                    'distance_km' => 783,
                    'duration_minutes' => 720,
                    'base_price' => 1200,
                ],
                [
                    'code' => 'RT-HRW-BHR',
                    'origin_city' => 'Hawassa',
                    'destination_city' => 'Bahir Dar',
                    'distance_km' => 450,
                    'duration_minutes' => 480,
                    'base_price' => 700,
                ],
            ];

            $createdRoutes = [];
            foreach ($routes as $routeData) {
                $route = TravelRoute::firstOrCreate(
                    ['code' => $routeData['code']],
                    array_merge($routeData, ['status' => 'active'])
                );
                $createdRoutes[] = $route;
            }

            // Get existing route
            $existingRoute = TravelRoute::where('code', 'RT-ADD-HRW')->first();
            if ($existingRoute) {
                $createdRoutes[] = $existingRoute;
            }

            // Create schedules for the next 7 days
            $now = Carbon::now();
            $scheduleCount = 0;

            foreach ($createdRoutes as $route) {
                // Create 2-3 schedules per route for different days
                $scheduleDays = [1, 2, 3]; // Next 1, 2, 3 days
                
                foreach ($scheduleDays as $dayOffset) {
                    $departureDate = $now->copy()->addDays($dayOffset);
                    
                    // Create morning schedule (8:00 AM)
                    $morningSchedule = Schedule::firstOrCreate(
                        [
                            'bus_id' => $buses[array_rand($buses)]->id,
                            'travel_route_id' => $route->id,
                            'departure_time' => $departureDate->copy()->setHour(8)->setMinute(0),
                        ],
                        [
                            'driver_id' => $drivers[array_rand($drivers)]->id,
                            'arrival_time' => $departureDate->copy()
                                ->setHour(8)
                                ->setMinute(0)
                                ->addMinutes($route->duration_minutes),
                            'boarding_point' => $route->origin_city . ' Main Terminal',
                            'dropoff_point' => $route->destination_city . ' Main Station',
                            'base_fare' => $route->base_price,
                            'dynamic_pricing_factor' => 1.0,
                            'status' => 'scheduled',
                            'booked_seat_count' => rand(0, 10),
                        ]
                    );

                    // Create afternoon schedule (2:00 PM)
                    $afternoonSchedule = Schedule::firstOrCreate(
                        [
                            'bus_id' => $buses[array_rand($buses)]->id,
                            'travel_route_id' => $route->id,
                            'departure_time' => $departureDate->copy()->setHour(14)->setMinute(0),
                        ],
                        [
                            'driver_id' => $drivers[array_rand($drivers)]->id,
                            'arrival_time' => $departureDate->copy()
                                ->setHour(14)
                                ->setMinute(0)
                                ->addMinutes($route->duration_minutes),
                            'boarding_point' => $route->origin_city . ' Main Terminal',
                            'dropoff_point' => $route->destination_city . ' Main Station',
                            'base_fare' => $route->base_price,
                            'dynamic_pricing_factor' => 1.0,
                            'status' => 'scheduled',
                            'booked_seat_count' => rand(0, 10),
                        ]
                    );

                    $scheduleCount += 2;
                }
            }

            $this->command->info("Created {$scheduleCount} test schedules across " . count($createdRoutes) . " routes.");
        });
    }
}

