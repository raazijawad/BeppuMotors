<?php

namespace Tests\Feature;

use App\Models\BuyAuction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BuyAuctionTest extends TestCase
{
    use RefreshDatabase;

    public function test_buying_at_auction_adds_the_vehicle_to_stock()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->post(route('auction.buy.store'), [
            'date' => '2026-09-04',
            'vehicle_name' => 'Toyota Aqua',
            'company' => 'Toyota',
            'colour' => 'White',
            'shopname' => 'Beppu Auction',
            'chassisnumber' => 'NHP10-1234567',
            'description' => 'Low mileage',
            'for_who' => 'Kato',
            'price' => '850000.00',
        ]);

        $response->assertRedirect();

        $buyAuction = BuyAuction::firstOrFail();

        $this->assertDatabaseHas('stocks', [
            'user_id' => $user->id,
            'buy_auction_id' => $buyAuction->id,
            'name' => 'Toyota Aqua',
            'company' => 'Toyota',
            'colour' => 'White',
            'shopname' => 'Beppu Auction',
            'chassisnumber' => 'NHP10-1234567',
            'description' => 'Low mileage',
            'price' => '850000.00',
        ]);
    }

    public function test_buying_at_auction_does_not_create_an_expense()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $this->post(route('auction.buy.store'), [
            'date' => '2026-09-04',
            'vehicle_name' => 'Toyota Aqua',
            'price' => '850000.00',
        ])->assertRedirect();

        $this->assertDatabaseCount('expenses', 0);
    }

    public function test_auction_purchase_is_absent_from_cashbook_entries()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $this->post(route('auction.buy.store'), [
            'date' => '2026-09-04',
            'vehicle_name' => 'Toyota Aqua',
            'price' => '850000.00',
        ])->assertRedirect();

        $this->get(route('cashbook', ['date' => '2026-09-01']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('entries', []));
    }

    public function test_deleting_a_buy_auction_removes_its_stock()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $this->post(route('auction.buy.store'), [
            'date' => '2026-09-04',
            'vehicle_name' => 'Toyota Aqua',
            'price' => '850000.00',
        ])->assertRedirect();

        $buyAuction = BuyAuction::firstOrFail();

        $this->delete(route('auction.buy.destroy', $buyAuction))->assertRedirect();

        $this->assertDatabaseCount('stocks', 0);
        $this->assertDatabaseCount('buy_auctions', 0);
    }
}
