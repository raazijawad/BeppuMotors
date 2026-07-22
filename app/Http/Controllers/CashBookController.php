<?php

namespace App\Http\Controllers;

use App\Models\Drawer;
use App\Models\Income;
use App\Models\Expense;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CashBookController extends Controller
{
    public function index(Request $request): Response
    {
        $date = $request->query('date');
        $month = $date ? substr($date, 0, 7) : now()->format('Y-m');

        $incomes = Income::where('date', 'like', $month . '%')->get()->map(fn ($i) => [
            'id' => $i->id,
            'type' => 'income',
            'name' => $i->income_name,
            'amount' => $i->amount,
            'description' => $i->description,
            'date' => $i->date,
            'created_at' => $i->created_at,
        ]);
        $expenses = Expense::where('date', 'like', $month . '%')->get()->map(fn ($e) => [
            'id' => $e->id,
            'type' => 'expense',
            'name' => $e->expense_name,
            'amount' => $e->amount,
            'description' => $e->description,
            'date' => $e->date,
            'created_at' => $e->created_at,
        ]);

        $entries = $incomes->concat($expenses)->sortBy('created_at')->values();

        $drawers = Drawer::latest()->get();

        return Inertia::render('cashbook', [
            'entries' => $entries,
            'drawers' => $drawers,
            'selectedMonth' => $month,
        ]);
    }
}
