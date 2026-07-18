<?php

namespace App\Http\Controllers;

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

        if ($request->user()) {
            $incomesQuery = $request->user()->incomes();
            $expensesQuery = $request->user()->expenses();

            if ($date) {
                $incomesQuery->where('date', $date);
                $expensesQuery->where('date', $date);
            }

            $incomes = $incomesQuery->latest()->get()->map(fn ($i) => [
                'id' => $i->id,
                'name' => $i->income_name,
                'amount' => $i->amount,
                'description' => $i->description,
                'date' => $i->date,
            ]);
            $expenses = $expensesQuery->latest()->get()->map(fn ($e) => [
                'id' => $e->id,
                'name' => $e->expense_name,
                'amount' => $e->amount,
                'description' => $e->description,
                'date' => $e->date,
            ]);
        } else {
            $incomes = collect();
            $expenses = collect();
        }

        return Inertia::render('cashbook', [
            'incomes' => $incomes,
            'expenses' => $expenses,
            'selectedDate' => $date,
        ]);
    }
}
