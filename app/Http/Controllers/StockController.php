<?php

namespace App\Http\Controllers;

use App\Models\Stock;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StockController extends Controller
{
    public function index(Request $request): Response
    {
        $stocks = Stock::where('user_id', $request->user()->id)->latest()->get();

        return Inertia::render('stock', [
            'stocks' => $stocks,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'company' => 'nullable|string|max:255',
            'colour' => 'nullable|string|max:255',
            'shopname' => 'nullable|string|max:255',
            'chassisnumber' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            't_price' => 'required|numeric|min:0',
            'n_price' => 'required|numeric|min:0',
            'a_price' => 'required|numeric|min:0',
            'expected_profit' => 'required|numeric|min:0',
        ]);

        $request->user()->stocks()->create($validated);

        return back();
    }

    public function destroy(Stock $stock): RedirectResponse
    {
        $stock->delete();
        return back();
    }
}
