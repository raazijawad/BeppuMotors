<?php

namespace App\Http\Controllers;

use App\Models\BuyAuction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BuyAuctionController extends Controller
{
    public function index(Request $request): Response
    {
        $buyAuctions = BuyAuction::latest()->get();

        return Inertia::render('auction/BuyAuction', [
            'buyAuctions' => $buyAuctions,
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

        $request->user()->buyAuctions()->create($validated);

        return back();
    }

    public function destroy(BuyAuction $buyAuction): RedirectResponse
    {
        $buyAuction->delete();
        return back();
    }

    public function paid(BuyAuction $buyAuction): RedirectResponse
    {
        $buyAuction->update(['paid' => true]);

        return back();
    }
}
