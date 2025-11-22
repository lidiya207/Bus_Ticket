<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bus_id')->constrained()->cascadeOnDelete();
            $table->foreignId('travel_route_id')->constrained()->cascadeOnDelete();
            $table->foreignId('driver_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamp('departure_time');
            $table->timestamp('arrival_time')->nullable();
            $table->string('boarding_point')->nullable();
            $table->string('dropoff_point')->nullable();
            $table->decimal('base_fare', 10, 2);
            $table->float('dynamic_pricing_factor')->default(1);
            $table->enum('status', ['scheduled', 'boarding', 'ongoing', 'completed', 'cancelled'])->default('scheduled');
            $table->unsignedInteger('booked_seat_count')->default(0);
            $table->timestamps();
            $table->index(['travel_route_id', 'departure_time']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schedules');
    }
};
