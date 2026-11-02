<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CashBookTest extends TestCase
{
    use RefreshDatabase;

    public function test_previous_month_net_is_the_first_entry_and_is_not_saved_as_income(): void
    {
        $user = User::factory()->create();
        $user->incomes()->create(['income_name' => 'Older income', 'amount' => 999, 'date' => '2026-09-30']);
        $user->incomes()->create(['income_name' => 'October income', 'amount' => 20000, 'date' => '2026-10-31']);
        $user->expenses()->create(['expense_name' => 'October expense', 'amount' => 5000, 'date' => '2026-10-31']);
        $user->incomes()->create(['income_name' => 'November income', 'amount' => 1000, 'date' => '2026-11-01']);

        for ($i = 0; $i < 2; $i++) {
            $this->actingAs($user)->get('/cashbook?date=2026-11-01')
                ->assertOk()->assertInertia(fn (Assert $page) => $page
                    ->component('cashbook')->where('selectedMonth', '2026-11')
                    ->has('entries', 2)
                    ->where('entries.0.type', 'opening')
                    ->where('entries.0.amount', 15999)
                    ->where('entries.0.date', '2026-11-01')
                    ->where('entries.1.name', 'November income'));
        }

        $this->assertDatabaseCount('incomes', 3);
        $this->actingAs($user)->get('/cashbook?date=2026-12-01')
            ->assertOk()->assertInertia(fn (Assert $page) => $page
                ->component('cashbook')->has('entries', 1)
                ->where('entries.0.amount', 16999)
                ->where('entries.0.date', '2026-12-01'));
    }

    public function test_default_month_rolls_over_at_the_start_of_the_year(): void
    {
        $this->travelTo(now()->setDate(2027, 1, 1)->startOfDay());
        $user = User::factory()->create();
        $user->incomes()->create(['income_name' => 'December income', 'amount' => 15000, 'date' => '2026-12-31']);

        $this->actingAs($user)->get('/cashbook')->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('cashbook')->where('selectedMonth', '2027-01')
                ->has('entries', 1)->where('entries.0.type', 'opening')
                ->where('entries.0.amount', 15000)->where('entries.0.date', '2027-01-01'));
    }

    public function test_empty_previous_month_has_no_opening_entry(): void
    {
        $this->actingAs(User::factory()->create())->get('/cashbook?date=2026-11-01')
            ->assertOk()->assertInertia(fn (Assert $page) => $page
                ->component('cashbook')->has('entries', 0));
    }
}
