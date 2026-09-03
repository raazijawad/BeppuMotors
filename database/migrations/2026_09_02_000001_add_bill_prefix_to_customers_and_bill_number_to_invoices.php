<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->string('bill_prefix', 10)->nullable()->after('name');
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->string('bill_number', 20)->nullable()->after('sale_id');
        });
    }

    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropColumn('bill_number');
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn('bill_prefix');
        });
    }
};
