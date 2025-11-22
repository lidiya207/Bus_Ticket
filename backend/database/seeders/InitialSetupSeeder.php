<?php

namespace Database\Seeders;

use App\Models\Bus;
use App\Models\Driver;
use App\Models\Schedule;
use App\Models\Seat;
use App\Models\TravelRoute;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

class InitialSetupSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::transaction(function () {
            $roles = ['admin', 'cashier', 'customer'];
            foreach ($roles as $roleName) {
                Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'api']);
            }

            $admin = User::firstOrCreate(
                ['email' => 'admin@busticket.com'],
                [
                    'name' => 'System Administrator',
                    'phone' => '0911000000',
                    'password' => Hash::make('password'),
                    'status' => 'active',
                ],
            );
            $admin->assignRole(Role::findByName('admin', 'api'));

            $cashier = User::firstOrCreate(
                ['email' => 'cashier@busticket.com'],
                [
                    'name' => 'Cashier User',
                    'phone' => '0911000001',
                    'password' => Hash::make('password'),
                    'status' => 'active',
                ],
            );
            $cashier->assignRole(Role::findByName('cashier', 'api'));

            $customer = User::firstOrCreate(
                ['email' => 'customer@busticket.com'],
                [
                    'name' => 'Test Customer',
                    'phone' => '0911000002',
                    'password' => Hash::make('password'),
                    'status' => 'active',
                ],
            );
            $customer->assignRole(Role::findByName('customer', 'api'));

            // Create multiple drivers for the buses
            $drivers = [];
            $driverNames = [
                ['first' => 'Dawit', 'last' => 'Bekele', 'phone' => '0911999999'],
                ['first' => 'Tewodros', 'last' => 'Girma', 'phone' => '0911999998'],
                ['first' => 'Mulugeta', 'last' => 'Tesfaye', 'phone' => '0911999997'],
                ['first' => 'Yonas', 'last' => 'Hailu', 'phone' => '0911999996'],
                ['first' => 'Solomon', 'last' => 'Mengistu', 'phone' => '0911999995'],
                ['first' => 'Getachew', 'last' => 'Assefa', 'phone' => '0911999994'],
                ['first' => 'Abebe', 'last' => 'Kebede', 'phone' => '0911999993'],
                ['first' => 'Haile', 'last' => 'Desta', 'phone' => '0911999992'],
            ];

            foreach ($driverNames as $index => $driverData) {
                $driver = Driver::firstOrCreate(
                    ['phone' => $driverData['phone']],
                    [
                        'first_name' => $driverData['first'],
                        'last_name' => $driverData['last'],
                        'license_number' => 'DRV-' . str_pad($index + 1, 3, '0', STR_PAD_LEFT),
                        'experience_years' => rand(5, 15),
                        'status' => 'active',
                    ]
                );
                $drivers[] = $driver;
            }

            // Create Ethiopian bus companies (Standard type, not VIP)
            $ethiopianBuses = [
                [
                    'code' => 'SELAM-001',
                    'plate_number' => 'AA-SELAM-001',
                    'capacity' => 45,
                    'type' => 'standard',
                    'amenities' => ['AC', 'WiFi'],
                ],
                [
                    'code' => 'SKY-001',
                    'plate_number' => 'AA-SKY-001',
                    'capacity' => 50,
                    'type' => 'standard',
                    'amenities' => ['AC', 'WiFi', 'Charger'],
                ],
                [
                    'code' => 'TATA-001',
                    'plate_number' => 'AA-TATA-001',
                    'capacity' => 40,
                    'type' => 'standard',
                    'amenities' => ['AC'],
                ],
                [
                    'code' => 'ABAY-001',
                    'plate_number' => 'AA-ABAY-001',
                    'capacity' => 45,
                    'type' => 'standard',
                    'amenities' => ['AC', 'WiFi'],
                ],
                [
                    'code' => 'GHION-001',
                    'plate_number' => 'AA-GHION-001',
                    'capacity' => 42,
                    'type' => 'standard',
                    'amenities' => ['AC'],
                ],
                [
                    'code' => 'SELAM-002',
                    'plate_number' => 'AA-SELAM-002',
                    'capacity' => 48,
                    'type' => 'standard',
                    'amenities' => ['AC', 'WiFi', 'Charger'],
                ],
                [
                    'code' => 'SKY-002',
                    'plate_number' => 'AA-SKY-002',
                    'capacity' => 46,
                    'type' => 'standard',
                    'amenities' => ['AC', 'WiFi'],
                ],
                [
                    'code' => 'TATA-002',
                    'plate_number' => 'AA-TATA-002',
                    'capacity' => 44,
                    'type' => 'standard',
                    'amenities' => ['AC', 'Charger'],
                ],
            ];

            $buses = [];
            foreach ($ethiopianBuses as $busData) {
                $bus = Bus::firstOrCreate(
                    ['code' => $busData['code']],
                    [
                        'plate_number' => $busData['plate_number'],
                        'capacity' => $busData['capacity'],
                        'type' => $busData['type'],
                        'amenities' => $busData['amenities'],
                        'status' => 'active',
                    ],
                );

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
                            'seat_class' => 'standard',
                            'is_window' => in_array(substr($label, -1), ['A', 'D']),
                        ]);
                    }
                }

                $buses[] = $bus;
            }

            // Keep the original VIP bus for testing
            $bus = Bus::firstOrCreate(
                ['code' => 'BUS-001'],
                [
                    'plate_number' => 'AA-12345',
                    'capacity' => 45,
                    'type' => 'vip',
                    'amenities' => ['AC', 'WiFi', 'Charger'],
                ],
            );

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

            $route = TravelRoute::firstOrCreate(
                ['code' => 'RT-ADD-HRW'],
                [
                    'origin_city' => 'Addis Ababa',
                    'destination_city' => 'Hawassa',
                    'distance_km' => 275,
                    'duration_minutes' => 300,
                    'base_price' => 650,
                    'status' => 'active',
                ],
            );

            // Create schedules for different buses and times
            $scheduleTimes = [
                ['hour' => 6, 'minute' => 0],
                ['hour' => 8, 'minute' => 30],
                ['hour' => 10, 'minute' => 0],
                ['hour' => 12, 'minute' => 0],
                ['hour' => 14, 'minute' => 30],
                ['hour' => 16, 'minute' => 0],
            ];

            $allBuses = $buses;
            foreach ($allBuses as $index => $scheduleBus) {
                if ($index < count($scheduleTimes)) {
                    $time = $scheduleTimes[$index];
                    $departureTime = Carbon::now()->addDay()->setHour($time['hour'])->setMinute($time['minute']);
                    $arrivalTime = $departureTime->copy()->addMinutes($route->duration_minutes);

                    Schedule::firstOrCreate(
                        [
                            'bus_id' => $scheduleBus->id,
                            'travel_route_id' => $route->id,
                            'departure_time' => $departureTime,
                        ],
                        [
                            'driver_id' => $drivers[$index % count($drivers)]->id,
                            'arrival_time' => $arrivalTime,
                            'boarding_point' => 'Mexico Terminal',
                            'dropoff_point' => 'Hawassa Main Station',
                            'base_fare' => 650,
                            'dynamic_pricing_factor' => 1,
                            'status' => 'scheduled',
                        ],
                    );
                }
            }
        });
    }
}
