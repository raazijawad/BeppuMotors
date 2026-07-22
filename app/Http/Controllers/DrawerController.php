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
        ]);

        $request->user()->drawers()->create([
            ...$validated,
            'date' => now()->toDateString(),
        ]);

        return back();
    }

    public function destroy(Drawer $drawer): RedirectResponse
    {
        $drawer->delete();

        return back();
    }
}
