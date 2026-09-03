<?php

namespace App\Http\Controllers;

use App\Models\Drawer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DrawerController extends Controller
{
    public function index(Request $request): Response
    {
        $drawers = Drawer::latest()->get();

        return Inertia::render('cashbook', [
            'entries' => collect(),
            'drawers' => $drawers,
            'selectedMonth' => now()->format('Y-m'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'date' => 'required|date',
        ]);

        $request->user()->drawers()->create([
            ...$validated,
            'source_type' => 'initial',
            'message' => "Created '{$validated['name']}' with amount {$validated['amount']}",
        ]);

        return back();
    }

    public function update(Request $request, Drawer $drawer): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'date' => 'required|date',
        ]);

        $oldAmount = (float) $drawer->amount;
        $newAmount = (float) $validated['amount'];

        $request->user()->drawers()->create([
            ...$validated,
            'parent_id' => $drawer->parent_id ?? $drawer->id,
            'source_type' => 'manual',
            'message' => "that {$oldAmount} to {$newAmount}",
        ]);

        return back();
    }

    public function destroy(Drawer $drawer): RedirectResponse
    {
        $drawer->delete();

        return back();
    }
}
