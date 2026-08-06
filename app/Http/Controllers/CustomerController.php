<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Stock;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function index(Request $request): Response
    {
        $customers = Customer::where('user_id', $request->user()->id)
            ->with('invoices.stock')
            ->latest()
            ->get();

        $stocks = Stock::where('user_id', $request->user()->id)->latest()->get();

        return Inertia::render('customer', [
            'customers' => $customers,
            'stocks' => $stocks,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
        ]);

        $request->user()->customers()->create($validated);

        return back();
    }

    public function storeInvoices(Request $request, Customer $customer): RedirectResponse
    {
        $validated = $request->validate([
            'lines' => 'required|array',
            'lines.*.stock_id' => 'required|exists:stocks,id',
            'lines.*.amount' => 'required|numeric|min:0',
            'date' => 'required|date',
        ]);

        foreach ($validated['lines'] as $line) {
            $customer->invoices()->create([
                'user_id' => $request->user()->id,
                'stock_id' => $line['stock_id'],
                'amount' => $line['amount'],
                'date' => $validated['date'],
            ]);
        }

        return back();
    }

    public function destroy(Customer $customer): RedirectResponse
    {
        $customer->delete();
        return back();
    }

    public function destroyInvoice(Invoice $invoice): RedirectResponse
    {
        $invoice->delete();
        return back();
    }
}
