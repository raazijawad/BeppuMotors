<?php

use App\Http\Controllers\CashBookController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DrawerController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\IncomeController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::inertia('pending', 'auth/pending')->name('registration.pending');

Route::middleware(['auth'])->group(function () {
    Route::inertia('/', 'home')->name('home');
    Route::get('vehicle-detail', [IncomeController::class, 'index'])->name('vehicle-detail');
    Route::get('cashbook', [CashBookController::class, 'index'])->name('cashbook');
    Route::inertia('drawer', 'drawer')->name('drawer');
    Route::get('customer', [CustomerController::class, 'index'])->name('customer');
    Route::post('customers', [CustomerController::class, 'store'])->name('customers.store');
    Route::delete('customers/{customer}', [CustomerController::class, 'destroy'])->name('customers.destroy');
    Route::post('customers/{customer}/invoices', [CustomerController::class, 'storeInvoices'])->name('customers.invoices.store');
    Route::delete('invoices/{invoice}', [CustomerController::class, 'destroyInvoice'])->name('invoices.destroy');

    Route::inertia('profile', 'profile')->name('profile');

    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::get('incomes', [IncomeController::class, 'index'])->name('incomes.index');
    Route::post('incomes', [IncomeController::class, 'store'])->name('incomes.store');
    Route::delete('incomes/{income}', [IncomeController::class, 'destroy'])->name('incomes.destroy');

    Route::get('stock', [StockController::class, 'index'])->name('stock');
    Route::post('stock', [StockController::class, 'store'])->name('stock.store');
    Route::delete('stock/{stock}', [StockController::class, 'destroy'])->name('stock.destroy');

    Route::get('expenses', [ExpenseController::class, 'index'])->name('expenses.index');
    Route::post('expenses', [ExpenseController::class, 'store'])->name('expenses.store');
    Route::put('expenses/{expense}', [ExpenseController::class, 'update'])->name('expenses.update');
    Route::delete('expenses/{expense}', [ExpenseController::class, 'destroy'])->name('expenses.destroy');

    Route::post('drawers', [DrawerController::class, 'store'])->name('drawers.store');
    Route::put('drawers/{drawer}', [DrawerController::class, 'update'])->name('drawers.update');
    Route::delete('drawers/{drawer}', [DrawerController::class, 'destroy'])->name('drawers.destroy');

    Route::middleware(['admin'])->prefix('admin')->group(function () {
        Route::get('users', [UserController::class, 'index'])->name('admin.users');
        Route::post('users/{user}/approve', [UserController::class, 'approve'])->name('admin.users.approve');
        Route::post('users/{user}/reject', [UserController::class, 'reject'])->name('admin.users.reject');
    });
});

require __DIR__.'/settings.php';
