<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sell_auctions', function (Blueprint $table) {
            $table->boolean('sold')->default(false)->after('auction_price');
        });
    }

    public function down(): void
    {
        Schema::table('sell_auctions', function (Blueprint $table) {
            $table->dropColumn('sold');
        });
    }
};
