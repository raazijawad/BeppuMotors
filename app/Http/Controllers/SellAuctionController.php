<?php

namespace App\Http\Controllers;

use App\Models\Income;
use App\Models\SellAuction;
use App\Models\Stock;
use App\Models\User;
use App\Notifications\DocumentNotSubmittedReminder;
use Closure;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Inertia\Inertia;
use Inertia\Response;

class SellAuctionController extends Controller
{
    public function index(): Response
    {
        $sellAuctions = SellAuction::with('stock')->latest()->get();
        $stocks = Stock::doesntHave('invoices')->doesntHave('sellAuctions')->latest()->get();

        return Inertia::render('auction/SellAuction', [
            'sellAuctions' => $sellAuctions,
            'stocks' => $stocks,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'stock_id' => [
                'required',
                'integer',
                'exists:stocks,id',
                function (string $attribute, mixed $value, Closure $fail) {
                    $stock = Stock::find($value);

                    if (
                        ! $stock ||
                        $stock->invoices()->exists() ||
                        $stock->sellAuctions()->exists()
                    ) {
                        $fail(
                            'This vehicle is no longer available. It may already have an invoice or be added to another auction.',
                        );
                    }
                },
            ],
            'auction_price' => 'nullable|numeric|min:0',
        ]);

        $sellAuction = $request->user()->sellAuctions()->create($validated);

        $sellAuction->loadMissing('stock');

        User::query()->each(
            fn (User $user) => $user->notify(
                new DocumentNotSubmittedReminder($sellAuction),
            ),
        );

        return back();
    }

    public function update(Request $request, SellAuction $sellAuction): RedirectResponse
    {
        $validated = $request->validate([
            'auction_price' => 'required|numeric|min:0',
        ]);

        $sellAuction->update($validated);

        Income::where('sell_auction_id', $sellAuction->id)->update([
            'amount' => $validated['auction_price'],
        ]);

        return back();
    }

    public function markSold(SellAuction $sellAuction): RedirectResponse
    {
        if ($sellAuction->sold) {
            return back();
        }

        if (! $sellAuction->document_submitted) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => __(
                    'Document not submitted. Cannot be sold — please submit the document first.',
                ),
            ]);

            return back();
        }

        $sellAuction->update(['sold' => true]);

        $sellAuction->loadMissing('stock');

        $sellAuction->user->incomes()->firstOrCreate(
            ['sell_auction_id' => $sellAuction->id],
            [
                'income_name' => $sellAuction->stock?->name ?? 'Sell Auction',
                'amount' => $sellAuction->auction_price,
                'description' => trim(($sellAuction->stock?->chassisnumber ?? '').' (Sold via auction)') ?: null,
                'date' => now()->toDateString(),
            ],
        );

        return back();
    }

    public function markDocumentSubmitted(SellAuction $sellAuction): RedirectResponse
    {
        $sellAuction->update(['document_submitted' => true]);

        $this->deleteDocumentReminders($sellAuction->id);

        return back();
    }

    public function destroy(SellAuction $sellAuction): RedirectResponse
    {
        $this->deleteDocumentReminders($sellAuction->id);
        Income::where('sell_auction_id', $sellAuction->id)->delete();
        $sellAuction->delete();

        return back();
    }

    private function deleteDocumentReminders(int $sellAuctionId): void
    {
        DatabaseNotification::where(
            'type',
            DocumentNotSubmittedReminder::class,
        )
            ->where('data->sell_auction_id', $sellAuctionId)
            ->delete();
    }
}
