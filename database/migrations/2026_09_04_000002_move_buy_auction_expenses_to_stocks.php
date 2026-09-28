<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $now = now();

        DB::table('buy_auctions')
            ->whereNotExists(function ($query) {
                $query->select(DB::raw(1))
                    ->from('stocks')
                    ->whereColumn('stocks.buy_auction_id', 'buy_auctions.id');
            })
            ->orderBy('id')
            ->get()
            ->each(function (object $auction) use ($now) {
                DB::table('stocks')->insert([
                    'user_id' => $auction->user_id,
                    'buy_auction_id' => $auction->id,
                    'name' => $auction->vehicle_name,
                    'company' => $auction->company,
                    'colour' => $auction->colour,
                    'shopname' => $auction->shopname,
                    'chassisnumber' => $auction->chassisnumber,
                    'description' => $auction->description,
                    'price' => $auction->price,
                    't_price' => 0,
                    'n_price' => 0,
                    'a_price' => '0',
                    'expected_profit' => 0,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            });

        DB::table('expenses')->whereNotNull('buy_auction_id')->delete();
    }

    public function down(): void
    {
        DB::table('stocks')
            ->whereNotNull('buy_auction_id')
            ->orderBy('id')
            ->get()
            ->each(function (object $stock) {
                $auction = DB::table('buy_auctions')->where('id', $stock->buy_auction_id)->first();

                DB::table('expenses')->insert([
                    'user_id' => $auction->user_id ?? $stock->user_id,
                    'buy_auction_id' => $stock->buy_auction_id,
                    'expense_name' => $auction->vehicle_name ?? $stock->name,
                    'amount' => $auction->price ?? $stock->price,
                    'description' => $auction->description ?? null,
                    'date' => $auction->date ?? now()->format('Y-m-d'),
                    'created_at' => $stock->created_at,
                    'updated_at' => $stock->updated_at,
                ]);

                DB::table('stocks')->where('id', $stock->id)->delete();
            });
    }
};
