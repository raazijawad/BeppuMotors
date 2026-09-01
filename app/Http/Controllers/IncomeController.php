<?php

namespace App\Http\Controllers;

use App\Models\BuyAuction;
use App\Models\Customer;
use App\Models\Income;
use App\Models\SellAuction;
use App\Notifications\DocumentNotSubmittedReminder;
use App\Notifications\UnpaidAuctionReminder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class IncomeController extends Controller
{
    public function index(Request $request): Response
    {
        $date = $request->query('date');

        $incomes = Income::with('customer')->latest()->get();

        $customers = Customer::orderBy('name')->get();

        $notifications = $request->user()
            ->unreadNotifications()
            ->where('type', UnpaidAuctionReminder::class)
            ->latest()
            ->get();

        $vehicles = BuyAuction::whereIn(
            'id',
            $notifications->pluck('data.buy_auction_id')->filter()->unique()
        )->get()->keyBy('id');

        $auctionNotifications = $notifications
            ->map(fn ($notification) => [
                'id' => $notification->id,
                'buy_auction_id' => $notification->data['buy_auction_id'] ?? null,
                'vehicle_name' => $notification->data['vehicle_name'] ?? null,
                'price' => $notification->data['price'] ?? null,
                'date' => $vehicles[$notification->data['buy_auction_id'] ?? null]->date ?? null,
                'shopname' => $vehicles[$notification->data['buy_auction_id'] ?? null]->shopname ?? null,
                'description' => $vehicles[$notification->data['buy_auction_id'] ?? null]->description ?? null,
            ])
            ->filter(fn ($notification) => isset($vehicles[$notification['buy_auction_id']]))
            ->values();

        $documentReminderNotifications = $request->user()
            ->unreadNotifications()
            ->where('type', DocumentNotSubmittedReminder::class)
            ->latest()
            ->get();

        $sellAuctions = SellAuction::with('stock')
            ->whereIn(
                'id',
                $documentReminderNotifications
                    ->pluck('data.sell_auction_id')
                    ->filter()
                    ->unique(),
            )
            ->get()
            ->keyBy('id');

        $documentNotifications = $documentReminderNotifications
            ->map(fn ($notification) => [
                'id' => $notification->id,
                'sell_auction_id' => $notification->data['sell_auction_id'] ?? null,
                'vehicle_name' => $sellAuctions[$notification->data['sell_auction_id'] ?? null]?->stock?->name
                    ?? ($notification->data['vehicle_name'] ?? null),
                'chassisnumber' => $notification->data['chassisnumber'] ?? null,
                'price' => $notification->data['auction_price'] ?? null,
            ])
            ->filter(
                fn ($notification) => isset($sellAuctions[$notification['sell_auction_id']])
                    && ! $sellAuctions[$notification['sell_auction_id']]->document_submitted,
            )
            ->values();

        return Inertia::render('vehicle-detail', [
            'incomes' => $incomes,
            'customers' => $customers,
            'selectedDate' => $date,
            'view' => $request->query('view'),
            'auctionNotifications' => $auctionNotifications,
            'documentNotifications' => $documentNotifications,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'income_name' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'description' => 'nullable|string|max:1000',
            'date' => 'required|date',
            'customer_id' => 'nullable|exists:customers,id',
        ]);

        $request->user()->incomes()->create($validated);

        return back();
    }

    public function destroy(Income $income): RedirectResponse
    {
        $income->delete();

        return back();
    }
}
