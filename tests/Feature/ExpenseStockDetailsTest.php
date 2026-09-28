<?php

namespace Tests\Feature;

use App\Models\Expense;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExpenseStockDetailsTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_expenses_page_exposes_every_stock_price_field_for_editing()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $stock = $user->stocks()->create([
            'name' => 'Toyota Voxy',
            'company' => 'Toyota',
            'colour' => 'White',
            'shopname' => 'SSF',
            'chassisnumber' => '245-424315',
            'price' => '150000',
            't_price' => '170000',
            'n_price' => '180000',
            'a_price' => '190000',
            'expected_profit' => '40000',
        ]);

        $expense = $user->expenses()->create([
            'expense_name' => 'Vehicle purchase',
            'amount' => '150000',
            'date' => now()->format('Y-m-d'),
            'stock_id' => $stock->id,
        ]);

        $payload = $this->get(route('expenses.index'))
            ->assertOk()
            ->viewData('page')['props']['expenses'];

        $found = collect($payload)->firstWhere('id', $expense->id);

        $this->assertNotNull($found, 'The expense was not returned by the expenses page.');
        $this->assertSame('Toyota Voxy', $found['stock']['name']);
        $this->assertEquals(170000, $found['stock']['t_price']);
        $this->assertEquals(180000, $found['stock']['n_price']);
        $this->assertEquals(190000, $found['stock']['a_price']);
        $this->assertEquals(40000, $found['stock']['expected_profit']);
    }

    public function test_updating_stock_details_from_an_expense_persists_them_for_the_edit_form()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $expense = $user->expenses()->create([
            'expense_name' => 'Vehicle purchase',
            'amount' => '150000',
            'date' => now()->format('Y-m-d'),
        ]);

        $this->put(route('expenses.update', $expense), [
            'expense_name' => 'Vehicle purchase',
            'amount' => '150000',
            'date' => now()->format('Y-m-d'),
            'name' => 'Toyota Voxy',
            'company' => 'Toyota',
            'colour' => 'White',
            'shopname' => 'SSF',
            'chassisnumber' => '245-424315',
            'price' => '150000',
            't_price' => '170000',
            'n_price' => '180000',
            'a_price' => '190000',
            'expected_profit' => '40000',
        ])->assertRedirect();

        $expense->refresh();

        $this->assertNotNull($expense->stock_id, 'No stock was linked to the expense.');

        $this->assertDatabaseHas('stocks', [
            'id' => $expense->stock_id,
            't_price' => 170000,
            'n_price' => 180000,
            'a_price' => '190000',
            'expected_profit' => 40000,
        ]);

        $reloaded = Expense::with('stock')->findOrFail($expense->id);

        $this->assertEquals(170000, $reloaded->stock->t_price);
        $this->assertEquals(180000, $reloaded->stock->n_price);
        $this->assertSame('190000', $reloaded->stock->a_price);
        $this->assertEquals(40000, $reloaded->stock->expected_profit);
    }

    public function test_an_over_limit_stock_price_is_rejected_instead_of_causing_a_sql_error()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $stock = $user->stocks()->create([
            'name' => 'Toyota Voxy',
            'price' => '150000',
            't_price' => 0,
            'n_price' => 0,
            'a_price' => '0',
            'expected_profit' => 0,
        ]);

        $expense = $user->expenses()->create([
            'expense_name' => 'Vehicle purchase',
            'amount' => '150000',
            'date' => now()->format('Y-m-d'),
            'stock_id' => $stock->id,
        ]);

        $response = $this->put(route('expenses.update', $expense), [
            'expense_name' => 'Vehicle purchase',
            'amount' => '150000',
            'date' => now()->format('Y-m-d'),
            'name' => 'Toyota Voxy',
            'price' => '62400',
            't_price' => '12313111111',
            'n_price' => '12321344',
            'expected_profit' => '1231234',
        ]);

        $response->assertSessionHasErrors('t_price');

        $this->assertDatabaseHas('stocks', [
            'id' => $stock->id,
            't_price' => 0,
        ]);
    }

    public function test_the_highest_price_the_column_accepts_is_still_saved()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $stock = $user->stocks()->create([
            'name' => 'Toyota Voxy',
            'price' => '150000',
            't_price' => 0,
            'n_price' => 0,
            'a_price' => '0',
            'expected_profit' => 0,
        ]);

        $expense = $user->expenses()->create([
            'expense_name' => 'Vehicle purchase',
            'amount' => '150000',
            'date' => now()->format('Y-m-d'),
            'stock_id' => $stock->id,
        ]);

        $this->put(route('expenses.update', $expense), [
            'expense_name' => 'Vehicle purchase',
            'amount' => '150000',
            'date' => now()->format('Y-m-d'),
            'name' => 'Toyota Voxy',
            'price' => '99999999.99',
            't_price' => '99999999.99',
            'n_price' => '99999999.99',
            'a_price' => '99999999.99',
            'expected_profit' => '99999999.99',
        ])->assertSessionHasNoErrors();

        $this->assertDatabaseHas('stocks', [
            'id' => $stock->id,
            't_price' => 99999999.99,
            'n_price' => 99999999.99,
            'expected_profit' => 99999999.99,
        ]);
    }
}
