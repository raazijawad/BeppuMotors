<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('admin/users', [
            'users' => User::query()
                ->orderByRaw('CASE WHEN status = ? THEN 0 ELSE 1 END', [User::STATUS_PENDING])
                ->latest()
                ->get(),
            'pendingCount' => User::query()->where('status', User::STATUS_PENDING)->count(),
        ]);
    }

    public function approve(User $user): RedirectResponse
    {
        $user->update(['status' => User::STATUS_ACTIVE]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "{$user->name} has been approved and can now log in.",
        ]);

        return back();
    }

    public function reject(User $user): RedirectResponse
    {
        $user->update(['status' => User::STATUS_REJECTED]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "{$user->name} has been rejected.",
        ]);

        return back();
    }

    public function updatePassword(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'password' => ['required', 'string', Password::default(), 'confirmed'],
        ]);

        $user->forceFill([
            'password' => $validated['password'],
        ])->save();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Password for {$user->name} has been updated.",
        ]);

        return back();
    }
}
