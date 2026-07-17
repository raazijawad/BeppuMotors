<?php

use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\IncomeController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'home')->name('home');
Route::get('vehicle-detail', [IncomeController::class, 'index'])->name('vehicle-detail');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::get('incomes', [IncomeController::class, 'index'])->name('incomes.index');
    Route::post('incomes', [IncomeController::class, 'store'])->name('incomes.store');
    Route::delete('incomes/{income}', [IncomeController::class, 'destroy'])->name('incomes.destroy');

    Route::get('expenses', [ExpenseController::class, 'index'])->name('expenses.index');
    Route::post('expenses', [ExpenseController::class, 'store'])->name('expenses.store');
    Route::delete('expenses/{expense}', [ExpenseController::class, 'destroy'])->name('expenses.destroy');
});

require __DIR__.'/settings.php';
