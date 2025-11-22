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
        Schema::create('buses', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('plate_number')->unique();
            $table->unsignedInteger('capacity');
            $table->enum('type', ['standard', 'vip', 'mini', 'sleeper'])->default('standard');
            $table->json('amenities')->nullable();
            $table->enum('status', ['active', 'maintenance', 'inactive'])->default('active');
            $table->timestamp('last_maintenance_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('buses');
    }
};
