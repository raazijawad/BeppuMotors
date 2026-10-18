<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stocks', function (Blueprint $table) {
            $table->boolean('vehicle_received')->default(false);
            $table->boolean('document_received')->default(false);
            $table->boolean('masho_fax')->default(false);
        });
    }

    public function down(): void
    {
        Schema::table('stocks', function (Blueprint $table) {
            $table->dropColumn(['vehicle_received', 'document_received', 'masho_fax']);
        });
    }
};



