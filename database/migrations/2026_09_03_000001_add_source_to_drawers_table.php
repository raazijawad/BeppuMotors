<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('drawers', function (Blueprint $table) {
            $table->string('source_type')->default('manual');
            $table->string('message')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('drawers', function (Blueprint $table) {
            $table->dropColumn('source_type');
            $table->dropColumn('message');
        });
    }
};
