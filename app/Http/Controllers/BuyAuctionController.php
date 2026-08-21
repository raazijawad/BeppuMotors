<?php

namespace App\Http\Controllers;

use App\Models\BuyAuction;
use App\Models\Expense;
use App\Notifications\UnpaidAuctionReminder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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

        $buyAuctions = BuyAuction::where('date', 'like', $month . '%')
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
            'price' => 'required|numeric|min:0',
        ]);

        $buyAuction = $request->user()->buyAuctions()->create($validated);

        $request->user()->expenses()->create([
            'expense_name' => $validated['vehicle_name'],
            'amount' => $validated['price'],
            'description' => $validated['description'] ?? null,
            'date' => $validated['date'],
            'buy_auction_id' => $buyAuction->id,
        ]);

        return back();
    }

    public function destroy(BuyAuction $buyAuction): RedirectResponse
    {
        Expense::where('buy_auction_id', $buyAuction->id)->delete();
        $buyAuction->delete();
        return back();
    }

    public function paid(BuyAuction $buyAuction): RedirectResponse
    {
        $buyAuction->update(['paid' => true]);

        $buyAuction->user->notifications()
            ->where('type', UnpaidAuctionReminder::class)
            ->where('data->buy_auction_id', $buyAuction->id)
            ->delete();

        return back();
    }
}
