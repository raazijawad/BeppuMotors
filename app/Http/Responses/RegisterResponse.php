<?php

namespace App\Http\Responses;

use Illuminate\Http\RedirectResponse;
use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;

class RegisterResponse implements RegisterResponseContract
{
    /**
     * Redirect the newly registered user to the pending approval notice
     * instead of logging them into the application.
     */
    public function toResponse($request): RedirectResponse
    {
        auth('web')->logout();

        return redirect()->route('registration.pending');
    }
}
