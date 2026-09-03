<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Stock;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function index(Request $request): Response
    {
        $customers = Customer::with(['invoices.stock', 'incomes', 'expenses'])->latest()->get();

        $stocks = Stock::doesntHave('invoices')->latest()->get();

        return Inertia::render('customer', [
            'customers' => $customers,
            'stocks' => $stocks,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'bill_prefix' => 'required|string|max:10',
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

        $saleId = (string) Str::uuid();

        $lastNumber = $customer->invoices()
            ->whereNotNull('bill_number')
            ->latest('bill_number')
            ->value('bill_number');

        if ($lastNumber && preg_match('/(\d+)$/', $lastNumber, $m)) {
            $next = (int) $m[1] + 1;
        } else {
            $next = 1;
        }

        $billNumber = ($customer->bill_prefix ?? '') . str_pad($next, 4, '0', STR_PAD_LEFT);

        foreach ($validated['lines'] as $line) {
            $customer->invoices()->create([
                'user_id' => $request->user()->id,
                'stock_id' => $line['stock_id'],
                'amount' => $line['amount'],
                'date' => $validated['date'],
                'sale_id' => $saleId,
                'bill_number' => $billNumber,
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
