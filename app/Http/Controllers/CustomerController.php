<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Stock;
use App\Support\BillNumber;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function index(Request $request): Response
    {
        $customers = Customer::with([
            'invoices.stock:id,name,chassisnumber',
            'invoices:id,customer_id,user_id,stock_id,amount,date,sale_id,bill_number,created_at',
            'incomes:id,customer_id,income_name,amount,date,created_at',
            'expenses:id,customer_id,expense_name,amount,date,created_at',
        ])
            ->select(['id', 'name', 'bill_prefix', 'phone', 'address'])
            ->latest()
            ->get();

        $stocks = Stock::doesntHave('invoices')
            ->doesntHave('sellAuctions')
            ->select(['id', 'name', 'company', 'shopname', 'chassisnumber', 'price'])
            ->latest()
            ->get();

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

    public function update(Request $request, Customer $customer): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'bill_prefix' => 'required|string|max:10',
            'phone' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
        ]);

        $customer->update($validated);

        return back();
    }

    public function storeInvoices(Request $request, Customer $customer): RedirectResponse
    {
        $validated = $request->validate([
            'lines' => 'required|array',
            'lines.*.stock_id' => 'required|exists:stocks,id',
            'lines.*.amount' => 'required|numeric|min:0|max:99999999.99',
            'date' => 'required|date',
        ]);

        $saleId = (string) Str::uuid();

        [$prefix, $startNumber, $width] = BillNumber::parse($customer->bill_prefix);

        $maxNumber = 0;
        $existingNumbers = $customer->invoices()
            ->whereNotNull('bill_number')
            ->pluck('bill_number');

        foreach ($existingNumbers as $existingNumber) {
            if (str_starts_with($existingNumber, $prefix) && preg_match('/(\d+)$/', $existingNumber, $m)) {
                $maxNumber = max($maxNumber, (int) $m[1]);
            }
        }

        $next = $maxNumber > 0 ? max($startNumber, $maxNumber + 1) : $startNumber;

        $billNumber = BillNumber::format($prefix, $width, $next);

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
