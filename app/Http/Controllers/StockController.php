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
        $stocks = Stock::doesntHave('invoices')
            ->doesntHave('sellAuctions')
            ->select(['id', 'name', 'company', 'colour', 'shopname', 'chassisnumber', 'description', 'price', 't_price', 'n_price', 'a_price', 'expected_profit'])
            ->latest()->get();

        return Inertia::render('stock', [
            'stocks' => $stocks,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validated($request);

        $request->user()->stocks()->create($validated);

        return back();
    }

    public function update(Request $request, Stock $stock): RedirectResponse
    {
        abort_if(
            $stock->user_id !== $request->user()->id,
            403,
        );

        $stock->update($this->validated($request));

        return back();
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request): array
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'company' => 'nullable|string|max:255',
            'colour' => 'nullable|string|max:255',
            'shopname' => 'nullable|string|max:255',
            'chassisnumber' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0|max:99999999.99',
            't_price' => 'nullable|numeric|min:0|max:99999999.99',
            'n_price' => 'nullable|numeric|min:0|max:99999999.99',
            'a_price' => 'nullable|string|max:255',
            'expected_profit' => 'required|numeric|min:0|max:99999999.99',
        ]);

        $validated['t_price'] ??= 0;
        $validated['n_price'] ??= 0;
        $validated['a_price'] ??= '0';

        return $validated;
    }

    public function destroy(Stock $stock): RedirectResponse
    {
        $stock->delete();

        return back();
    }
}
