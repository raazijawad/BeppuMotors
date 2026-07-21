<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExpenseController extends Controller
{
    public function index(Request $request): Response
    {
        $date = $request->query('date');

        $expenses = Expense::latest()->get();

        return Inertia::render('expenses', [
            'expenses' => $expenses,
            'selectedDate' => $date,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'expense_name' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'description' => 'nullable|string|max:1000',
            'date' => 'required|date',
        ]);

        $request->user()->expenses()->create($validated);

        return back();
    }

    public function destroy(Expense $expense): RedirectResponse
    {
        $expense->delete();

        return back();
    }
}
