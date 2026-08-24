<?php

namespace App\Http\Controllers;

use App\Models\ExportCountry;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExportController extends Controller
{
    public function index(): Response
    {
        $countries = ExportCountry::withCount('customers')->latest()->get();

        return Inertia::render('export/export', [
            'countries' => $countries,
        ]);
    }

    public function storeCountry(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:export_countries,name,NULL,id,user_id,'.$request->user()->id,
        ]);

        $request->user()->exportCountries()->create($validated);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Country added.'),
        ]);

        return back();
    }

    public function show(ExportCountry $exportCountry): Response
    {
        $exportCountry->load([
            'customers' => fn ($query) => $query->latest(),
        ]);

        return Inertia::render('export/exportCountry', [
            'country' => $exportCountry->only('id', 'name'),
            'customers' => $exportCountry->customers,
        ]);
    }

    public function storeCustomer(
        Request $request,
        ExportCountry $exportCountry,
    ): RedirectResponse {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $exportCountry->customers()->create([
            ...$validated,
            'user_id' => $request->user()->id,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Customer added.'),
        ]);

        return back();
    }
}
