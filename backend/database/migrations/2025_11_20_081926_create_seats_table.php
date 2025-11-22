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
        Schema::create('seats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bus_id')->constrained()->cascadeOnDelete();
            $table->string('label');
            $table->enum('seat_class', ['standard', 'vip', 'accessible'])->default('standard');
            $table->enum('status', ['available', 'maintenance', 'blocked'])->default('available');
            $table->boolean('is_window')->default(false);
            $table->timestamps();
            $table->unique(['bus_id', 'label']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('seats');
    }
};
