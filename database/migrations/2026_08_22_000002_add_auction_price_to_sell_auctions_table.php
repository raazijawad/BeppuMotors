<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sell_auctions', function (Blueprint $table) {
            $table->decimal('auction_price', 10, 2)->nullable()->after('stock_id');
        });
    }

    public function down(): void
    {
        Schema::table('sell_auctions', function (Blueprint $table) {
            $table->dropColumn('auction_price');
        });
    }
};
