<?php

namespace App\Http\Controllers;

use App\Models\Drawer;
use App\Models\Expense;
use App\Models\Income;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class CashBookController extends Controller
{
    public function index(Request $request): Response
    {
        $date = $request->query('date');
        $month = $date ? substr($date, 0, 7) : now()->format('Y-m');

        $previousMonth = Carbon::parse($month . '-01')->subMonth()->format('Y-m');
        $openingBalance = Income::where('date', '<', $month . '-01')->sum('amount')
            - Expense::where('date', '<', $month . '-01')->sum('amount');

        $incomes = Income::with('customer:id,name')
            ->select([
                'id',
                'customer_id',
                'income_name',
                'amount',
                'description',
                'date',
                'created_at',
            ])
            ->where('date', '>=', $month . '-01')
            ->where('date', '<', date('Y-m-d', strtotime($month . '-01 +1 month')))
            ->get()
            ->map(fn ($i) => [
                'id' => $i->id,
                'type' => 'income',
                'name' => $i->income_name,
                'amount' => $i->amount,
                'description' => $i->description,
                'date' => $i->date,
                'created_at' => $i->created_at,
                'customer' => $i->customer?->name,
            ]);
        $expenses = Expense::with('customer:id,name')
            ->select([
                'id',
                'customer_id',
                'expense_name',
                'amount',
                'description',
                'date',
                'created_at',
            ])
            ->where('date', '>=', $month . '-01')
            ->where('date', '<', date('Y-m-d', strtotime($month . '-01 +1 month')))
            ->get()
            ->map(fn ($e) => [
                'id' => $e->id,
                'type' => 'expense',
                'name' => $e->expense_name,
                'amount' => $e->amount,
                'description' => $e->description,
                'date' => $e->date,
                'created_at' => $e->created_at,
                'customer' => $e->customer?->name,
            ]);

        $entries = $incomes->concat($expenses)->sortBy('created_at')->values();

        if ($openingBalance != 0) {
            $entries->prepend([
                'id' => 'opening-' . $month,
                'type' => 'opening',
                'name' => 'Balance brought forward',
                'amount' => $openingBalance,
                'description' => 'Net amount from ' . Carbon::parse($previousMonth . '-01')->format('F Y'),
                'date' => $month . '-01',
                'created_at' => null,
                'customer' => null,
            ]);
        }

        $drawers = Drawer::latest()
            ->select(['id', 'name', 'amount', 'parent_id', 'date', 'created_at', 'source_type', 'message'])
            ->get();

        return Inertia::render('cashbook', [
            'entries' => $entries,
            'drawers' => $drawers,
            'selectedMonth' => $month,
        ]);
    }
}
