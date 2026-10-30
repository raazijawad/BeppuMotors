<?php

namespace Tests\Feature;

use App\Models\SellAuction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SellAuctionTest extends TestCase
{
    use RefreshDatabase;

    private function makeSellAuction(User $user, array $attributes = []): SellAuction
    {
        $stock = $user->stocks()->create([
            'name' => 'Toyota Voxy',
            'chassisnumber' => 'MR020-1234567',
            'price' => '150000',
            't_price' => 0,
            'n_price' => 0,
            'a_price' => '0',
            'expected_profit' => 0,
        ]);

        return $user->sellAuctions()->create(array_merge([
            'stock_id' => $stock->id,
            'auction_price' => '900000',
            'document_submitted' => true,
            'sold' => false,
        ], $attributes));
    }

    public function test_selling_an_auction_does_not_create_an_income()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $sellAuction = $this->makeSellAuction($user);

        $this->post(route('auction.sell.sold', $sellAuction))->assertRedirect();

        $this->assertTrue($sellAuction->fresh()->sold);
        $this->assertDatabaseCount('incomes', 0);
    }

    public function test_sold_auction_is_absent_from_cashbook_entries()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $sellAuction = $this->makeSellAuction($user);

        $this->post(route('auction.sell.sold', $sellAuction))->assertRedirect();

        $this->get(route('cashbook', ['date' => now()->format('Y-m-01')]))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('entries', []));
    }

    public function test_sold_auction_is_absent_from_the_income_list()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $sellAuction = $this->makeSellAuction($user);

        $this->post(route('auction.sell.sold', $sellAuction))->assertRedirect();

        $this->get(route('incomes.index', ['date' => now()->format('Y-m-01')]))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('incomes', []));
    }

    public function test_a_sold_auction_price_can_be_updated()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $sellAuction = $this->makeSellAuction($user, ['sold' => true]);

        $this->put(route('auction.sell.update', $sellAuction), [
            'auction_price' => '123456',
        ])->assertRedirect();

        $this->assertEquals(123456, $sellAuction->fresh()->auction_price);
    }

    public function test_an_unsold_auction_price_can_still_be_updated()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $sellAuction = $this->makeSellAuction($user);

        $this->put(route('auction.sell.update', $sellAuction), [
            'auction_price' => '123456',
        ])->assertRedirect();

        $this->assertEquals(123456, $sellAuction->fresh()->auction_price);
    }
}
