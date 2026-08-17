<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('buy_auctions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->string('vehicle_name');
            $table->string('company')->nullable();
            $table->string('colour')->nullable();
            $table->string('shopname')->nullable();
            $table->string('chassisnumber')->nullable();
            $table->text('description')->nullable();
            $table->string('for_who')->nullable();
            $table->decimal('price', 10, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('buy_auctions');
    }
};
