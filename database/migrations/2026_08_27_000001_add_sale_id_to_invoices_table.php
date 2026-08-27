<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->string('sale_id')->nullable()->index();
        });

        DB::table('invoices')
            ->select('customer_id', 'date')
            ->distinct()
            ->get()
            ->each(function ($group) {
                DB::table('invoices')
                    ->where('customer_id', $group->customer_id)
                    ->where('date', $group->date)
                    ->update([
                        'sale_id' => 'legacy-'.$group->customer_id.'-'.$group->date,
                    ]);
            });
    }

    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropColumn('sale_id');
        });
    }
};