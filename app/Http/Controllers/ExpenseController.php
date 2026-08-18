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

        $expenses = Expense::with(['stock', 'buyAuction'])->latest()->get();

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

        $expense = $request->user()->expenses()->create($validated);

        if ($request->filled('name')) {
            $stock = $request->user()->stocks()->create([
                'name' => $request->input('name'),
                'company' => $request->input('company'),
                'colour' => $request->input('colour'),
                'shopname' => $request->input('shopname'),
                'chassisnumber' => $request->input('chassisnumber'),
                'description' => $request->input('description'),
                'price' => $request->input('price', 0),
                't_price' => $request->input('t_price', 0),
                'n_price' => $request->input('n_price', 0),
                'a_price' => $request->input('a_price', 0),
                'expected_profit' => $request->input('expected_profit', 0),
            ]);

            $expense->update(['stock_id' => $stock->id]);
        }

        return back();
    }

    public function destroy(Expense $expense): RedirectResponse
    {
        $expense->delete();

        return back();
    }

    public function update(Request $request, Expense $expense): RedirectResponse
    {
        $validated = $request->validate([
            'expense_name' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'description' => 'nullable|string|max:1000',
            'date' => 'required|date',
        ]);

        $expense->update($validated);

        if ($request->filled('name')) {
            $stockData = [
                'name' => $request->input('name'),
                'company' => $request->input('company'),
                'colour' => $request->input('colour'),
                'shopname' => $request->input('shopname'),
                'chassisnumber' => $request->input('chassisnumber'),
                'description' => $request->input('description'),
                'price' => $request->input('price', 0),
                't_price' => $request->input('t_price', 0),
                'n_price' => $request->input('n_price', 0),
                'a_price' => $request->input('a_price', 0),
                'expected_profit' => $request->input('expected_profit', 0),
            ];

            if ($expense->stock_id) {
                $expense->stock->update($stockData);
            } else {
                $stock = $request->user()->stocks()->create($stockData);
                $expense->update(['stock_id' => $stock->id]);
            }
        }

        return back();
    }
}
