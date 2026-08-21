<?php

namespace App\Http\Controllers;

use App\Models\SellAuction;
use App\Models\Stock;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
            'stock_id' => 'required|integer|exists:stocks,id',
            'auction_price' => 'required|numeric|min:0',
        ]);

        Stock::doesntHave('invoices')
            ->doesntHave('sellAuctions')
            ->findOrFail($validated['stock_id']);

        $request->user()->sellAuctions()->create($validated);

        return back();
    }

    public function update(Request $request, SellAuction $sellAuction): RedirectResponse
    {
        $validated = $request->validate([
            'auction_price' => 'required|numeric|min:0',
        ]);

        $sellAuction->update($validated);

        return back();
    }

    public function destroy(SellAuction $sellAuction): RedirectResponse
    {
        $sellAuction->delete();

        return back();
    }
}
