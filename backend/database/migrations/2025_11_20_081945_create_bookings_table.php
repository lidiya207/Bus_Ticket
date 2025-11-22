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
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('schedule_id')->constrained()->cascadeOnDelete();
            $table->enum('channel', ['online', 'cashier', 'api'])->default('online');
            $table->string('customer_name');
            $table->string('customer_phone');
            $table->string('customer_email')->nullable();
            $table->json('seats');
            $table->decimal('subtotal', 10, 2);
            $table->decimal('fees', 10, 2)->default(0);
            $table->decimal('total_amount', 10, 2);
            $table->enum('status', ['pending', 'confirmed', 'cancelled', 'refunded'])->default('pending');
            $table->enum('payment_status', ['unpaid', 'paid', 'refunded'])->default('unpaid');
            $table->timestamp('checked_in_at')->nullable();
            $table->string('qr_code_path')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->index(['schedule_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
