<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('buy_auctions', function (Blueprint $table) {
            $table->boolean('fax')->default(false);
            $table->boolean('fax_confirmed')->default(false);
        });
    }

    public function down(): void
    {
        Schema::table('buy_auctions', function (Blueprint $table) {
            $table->dropColumn(['fax', 'fax_confirmed']);
        });
    }
};
