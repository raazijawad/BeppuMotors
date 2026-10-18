<?php

namespace Tests\Feature;

use App\Http\Middleware\HandleInertiaRequests;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

class StockReceivedNotificationTest extends TestCase
{
    use RefreshDatabase;

    private function makeStock(User $user, array $attributes = [])
    {
        return $user->stocks()->create(array_merge([
            'name' => 'Toyota Voxy',
            'chassisnumber' => 'MR020-1234567',
            'price' => '150000',
            't_price' => 0,
            'n_price' => 0,
            'a_price' => '0',
            'expected_profit' => 0,
        ], $attributes));
    }

    private function stockNotifications(User $user): array
    {
        $version = (new HandleInertiaRequests)->version(Request::create('/'));

        $response = $this->actingAs($user)->get(route('vehicle-detail'), [
            'X-Inertia' => 'true',
            'X-Inertia-Version' => (string) $version,
            'X-Inertia-Partial-Component' => 'vehicle-detail',
            'X-Inertia-Partial-Data' => 'stockNotifications',
        ]);

        $response->assertOk();

        return $response->json('props.stockNotifications') ?? [];
    }

    public function test_it_reports_a_stock_item_when_the_vehicle_and_document_are_not_received()
    {
        $user = User::factory()->create();
        $this->makeStock($user);

        $notifications = $this->stockNotifications($user);

        $this->assertCount(1, $notifications);
        $this->assertFalse($notifications[0]['vehicle_received']);
        $this->assertFalse($notifications[0]['document_received']);
        $this->assertFalse($notifications[0]['masho_fax']);
        $this->assertSame('Toyota Voxy', $notifications[0]['vehicle_name']);
    }

    public function test_it_stops_reminding_when_the_vehicle_received_yes_button_is_clicked()
    {
        $user = User::factory()->create();
        $stock = $this->makeStock($user);

        $this->assertCount(1, $this->stockNotifications($user));

        $this->actingAs($user)->put(route('stock.update', $stock), [
            'name' => $stock->name,
            'price' => $stock->price,
            'expected_profit' => $stock->expected_profit,
            'vehicle_received' => true,
            'document_received' => false,
        ])->assertRedirect();

        $notifications = $this->stockNotifications($user);

        $this->assertCount(1, $notifications);
        $this->assertTrue($notifications[0]['vehicle_received']);
        $this->assertFalse($notifications[0]['document_received']);
    }

    public function test_it_stops_reminding_when_the_document_received_yes_button_is_clicked()
    {
        $user = User::factory()->create();
        $stock = $this->makeStock($user);

        $this->assertCount(1, $this->stockNotifications($user));

        $this->actingAs($user)->put(route('stock.update', $stock), [
            'name' => $stock->name,
            'price' => $stock->price,
            'expected_profit' => $stock->expected_profit,
            'vehicle_received' => false,
            'document_received' => true,
        ])->assertRedirect();

        $notifications = $this->stockNotifications($user);

        $this->assertCount(1, $notifications);
        $this->assertFalse($notifications[0]['vehicle_received']);
        $this->assertTrue($notifications[0]['document_received']);
    }

    public function test_it_stops_reminding_when_the_masho_fax_yes_button_is_clicked()
    {
        $user = User::factory()->create();
        $stock = $this->makeStock($user, [
            'vehicle_received' => true,
            'document_received' => true,
        ]);

        $this->assertCount(1, $this->stockNotifications($user));

        $this->actingAs($user)->put(route('stock.update', $stock), [
            'name' => $stock->name,
            'price' => $stock->price,
            'expected_profit' => $stock->expected_profit,
            'vehicle_received' => true,
            'document_received' => true,
            'masho_fax' => true,
        ])->assertRedirect();

        $this->assertCount(0, $this->stockNotifications($user));
    }

    public function test_it_keeps_reminding_while_the_masho_fax_is_still_missing()
    {
        $user = User::factory()->create();
        $stock = $this->makeStock($user);

        $this->actingAs($user)->put(route('stock.update', $stock), [
            'name' => $stock->name,
            'price' => $stock->price,
            'expected_profit' => $stock->expected_profit,
            'vehicle_received' => true,
            'document_received' => true,
            'masho_fax' => false,
        ])->assertRedirect();

        $notifications = $this->stockNotifications($user);

        $this->assertCount(1, $notifications);
        $this->assertTrue($notifications[0]['vehicle_received']);
        $this->assertTrue($notifications[0]['document_received']);
        $this->assertFalse($notifications[0]['masho_fax']);
    }

    public function test_it_does_not_report_a_stock_item_once_all_three_are_done()
    {
        $user = User::factory()->create();
        $stock = $this->makeStock($user);

        $this->actingAs($user)->put(route('stock.update', $stock), [
            'name' => $stock->name,
            'price' => $stock->price,
            'expected_profit' => $stock->expected_profit,
            'vehicle_received' => true,
            'document_received' => true,
            'masho_fax' => true,
        ])->assertRedirect();

        $this->assertCount(0, $this->stockNotifications($user));
    }

    public function test_it_does_not_report_sold_stock_items()
    {
        $user = User::factory()->create();
        $stock = $this->makeStock($user);

        $user->sellAuctions()->create([
            'stock_id' => $stock->id,
            'auction_price' => null,
            'document_submitted' => false,
            'sold' => false,
        ]);

        $this->assertCount(0, $this->stockNotifications($user));
    }
}
