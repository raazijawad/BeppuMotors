<?php

namespace App\Http\Controllers;

use App\Models\BuyAuction;
use App\Models\Stock;
use App\Models\User;
use App\Notifications\UnpaidAuctionReminder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class BuyAuctionController extends Controller
{
    public function index(Request $request): Response
    {
        $date = $request->query('date');
        $month = $date ? substr($date, 0, 7) : now()->format('Y-m');

        $highlightId = $request->query('highlight');
        if ($highlightId) {
            $highlight = BuyAuction::find($highlightId);
            if ($highlight) {
                $month = substr($highlight->date, 0, 7);
            }
        }

        $buyAuctions = BuyAuction::where('date', 'like', $month.'%')
            ->latest()
            ->get();

        return Inertia::render('auction/BuyAuction', [
            'buyAuctions' => $buyAuctions,
            'selectedMonth' => $month,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'vehicle_name' => 'required|string|max:255',
            'company' => 'nullable|string|max:255',
            'colour' => 'nullable|string|max:255',
            'shopname' => 'nullable|string|max:255',
            'chassisnumber' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'for_who' => 'nullable|string|max:255',
            'price' => 'required|numeric|min:0|max:99999999.99',
        ]);

        DB::transaction(function () use ($request, $validated) {
            $buyAuction = $request->user()->buyAuctions()->create($validated);

            $request->user()->stocks()->create([
                'name' => $validated['vehicle_name'],
                'company' => $validated['company'] ?? null,
                'colour' => $validated['colour'] ?? null,
                'shopname' => $validated['shopname'] ?? null,
                'chassisnumber' => $validated['chassisnumber'] ?? null,
                'description' => $validated['description'] ?? null,
                'price' => $validated['price'],
                't_price' => 0,
                'n_price' => 0,
                'a_price' => '0',
                'expected_profit' => 0,
                'buy_auction_id' => $buyAuction->id,
            ]);

            User::query()->each(
                fn (User $user) => $user->notify(
                    new UnpaidAuctionReminder($buyAuction),
                ),
            );
        });

        return back();
    }

    public function destroy(BuyAuction $buyAuction): RedirectResponse
    {
        Stock::where('buy_auction_id', $buyAuction->id)->delete();

        DatabaseNotification::where('type', UnpaidAuctionReminder::class)
            ->where('data->buy_auction_id', $buyAuction->id)
            ->delete();

        $buyAuction->delete();

        return back();
    }

    public function paid(BuyAuction $buyAuction): RedirectResponse
    {
        $buyAuction->update(['paid' => true]);

        DatabaseNotification::where('type', UnpaidAuctionReminder::class)
            ->where('data->buy_auction_id', $buyAuction->id)
            ->delete();

        return back();
    }
}
