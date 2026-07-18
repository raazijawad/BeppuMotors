<?php

namespace App\Http\Controllers;

use App\Models\Income;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class IncomeController extends Controller
{
    public function index(Request $request): Response
    {
        $date = $request->query('date');

        $incomesQuery = $request->user()
            ? $request->user()->incomes()
            : null;

        if ($incomesQuery) {
            if ($date) {
                $incomesQuery->where('date', $date);
            }
            $incomes = $incomesQuery->latest()->get();
        } else {
            $incomes = collect();
        }

        return Inertia::render('vehicle-detail', [
            'incomes' => $incomes,
            'selectedDate' => $date,
            'view' => $request->query('view'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'income_name' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'description' => 'nullable|string|max:1000',
            'date' => 'required|date',
        ]);

        $request->user()->incomes()->create($validated);

        return back();
    }

    public function destroy(Income $income): RedirectResponse
    {
        $income->delete();

        return back();
    }
}
