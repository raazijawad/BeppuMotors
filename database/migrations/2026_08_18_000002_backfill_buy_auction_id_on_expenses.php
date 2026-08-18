<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $buyAuctions = DB::table('buy_auctions')->get();

        foreach ($buyAuctions as $auction) {
            DB::table('expenses')
                ->where('user_id', $auction->user_id)
                ->where('expense_name', $auction->vehicle_name)
                ->where('date', $auction->date)
                ->where('amount', $auction->price)
                ->whereNull('buy_auction_id')
                ->limit(1)
                ->update(['buy_auction_id' => $auction->id]);
        }
    }

    public function down(): void
    {
        DB::table('expenses')->whereNotNull('buy_auction_id')->update(['buy_auction_id' => null]);
    }
};
