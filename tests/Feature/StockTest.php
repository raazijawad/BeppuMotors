<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StockTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_stock_item_can_be_created_without_the_optional_prices()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->post(route('stock.store'), [
            'name' => 'Toyota Voxy',
            'price' => '150000',
            'expected_profit' => '25000',
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('stocks', [
            'user_id' => $user->id,
            'name' => 'Toyota Voxy',
            'price' => '150000.00',
            't_price' => '0.00',
            'n_price' => '0.00',
            'a_price' => '0',
            'expected_profit' => '25000.00',
        ]);
    }

    public function test_a_stock_item_can_be_updated()
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

        $response = $this->put(route('stock.update', $stock), [
            'name' => 'Toyota Voxy Hybrid',
            'company' => 'Toyota',
            'colour' => 'White',
            'price' => '160000',
            't_price' => '180000',
            'n_price' => '190000',
            'a_price' => '200000',
            'expected_profit' => '40000',
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('stocks', [
            'id' => $stock->id,
            'name' => 'Toyota Voxy Hybrid',
            'company' => 'Toyota',
            'colour' => 'White',
            'price' => '160000.00',
            't_price' => '180000.00',
            'n_price' => '190000.00',
            'a_price' => '200000',
            'expected_profit' => '40000.00',
        ]);
    }

    public function test_updating_a_stock_item_can_clear_the_optional_prices()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $stock = $user->stocks()->create([
            'name' => 'Toyota Voxy',
            'price' => '150000',
            't_price' => 180000,
            'n_price' => 190000,
            'a_price' => '200000',
            'expected_profit' => 40000,
        ]);

        $this->put(route('stock.update', $stock), [
            'name' => 'Toyota Voxy',
            'price' => '150000',
            'expected_profit' => '40000',
        ])->assertRedirect();

        $this->assertDatabaseHas('stocks', [
            'id' => $stock->id,
            't_price' => '0.00',
            'n_price' => '0.00',
            'a_price' => '0',
        ]);
    }

    public function test_a_user_cannot_update_another_users_stock_item()
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $this->actingAs($user);

        $stock = $otherUser->stocks()->create([
            'name' => 'Toyota Voxy',
            'price' => '150000',
            't_price' => 0,
            'n_price' => 0,
            'a_price' => '0',
            'expected_profit' => 0,
        ]);

        $this->put(route('stock.update', $stock), [
            'name' => 'Hijacked',
            'price' => '1',
            'expected_profit' => '1',
        ])->assertForbidden();

        $this->assertDatabaseHas('stocks', [
            'id' => $stock->id,
            'name' => 'Toyota Voxy',
        ]);
    }

    public function test_the_stock_page_lists_unsold_stock_items()
    {
        $user = User::factory()->create();

        $user->stocks()->create([
            'name' => 'Toyota Voxy',
            'price' => '150000',
            't_price' => 0,
            'n_price' => 0,
            'a_price' => '0',
            'expected_profit' => 0,
        ]);

        $this->actingAs($user)
            ->get(route('stock'))
            ->assertOk()
            ->assertSee('Toyota Voxy');
    }
}
