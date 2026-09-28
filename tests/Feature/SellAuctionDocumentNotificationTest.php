<?php

namespace Tests\Feature;

use App\Http\Middleware\HandleInertiaRequests;
use App\Models\SellAuction;
use App\Models\User;
use App\Notifications\DocumentNotSubmittedReminder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

class SellAuctionDocumentNotificationTest extends TestCase
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
            'auction_price' => null,
            'document_submitted' => false,
            'sold' => false,
        ], $attributes));
    }

    private function documentNotifications(User $user): array
    {
        $version = (new HandleInertiaRequests)->version(Request::create('/'));

        $response = $this->actingAs($user)->get(route('vehicle-detail'), [
            'X-Inertia' => 'true',
            'X-Inertia-Version' => (string) $version,
            'X-Inertia-Partial-Component' => 'vehicle-detail',
            'X-Inertia-Partial-Data' => 'documentNotifications',
        ]);

        $response->assertOk();

        return $response->json('props.documentNotifications') ?? [];
    }

    public function test_it_reports_both_the_document_and_the_price_as_missing()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $stock = $user->stocks()->create([
            'name' => 'Toyota Voxy',
            'chassisnumber' => 'MR020-1234567',
            'price' => '150000',
            't_price' => 0,
            'n_price' => 0,
            'a_price' => '0',
            'expected_profit' => 0,
        ]);

        $this->post(route('auction.sell.store'), ['stock_id' => $stock->id])->assertRedirect();

        $notifications = $this->documentNotifications($user);

        $this->assertCount(1, $notifications);
        $this->assertFalse($notifications[0]['document_submitted']);
        $this->assertFalse($notifications[0]['price_is_set']);
        $this->assertNull($notifications[0]['price']);
    }

    public function test_it_keeps_reminding_about_the_price_after_the_document_is_submitted()
    {
        $user = User::factory()->create();
        $this->actingAs($user);
        $sellAuction = $this->makeSellAuction($user);

        $sellAuction->user->notify(new DocumentNotSubmittedReminder($sellAuction));

        $this->post(route('auction.sell.documents', $sellAuction))->assertRedirect();

        $this->assertTrue($sellAuction->fresh()->document_submitted);

        $notifications = $this->documentNotifications($user);

        $this->assertCount(1, $notifications, 'Price is still unset, so the reminder must survive.');
        $this->assertTrue($notifications[0]['document_submitted']);
        $this->assertFalse($notifications[0]['price_is_set']);

        $this->put(route('auction.sell.update', $sellAuction), [
            'auction_price' => '900000',
        ])->assertRedirect();

        $this->assertCount(0, $this->documentNotifications($user));
    }

    public function test_it_stops_reminding_once_both_the_document_and_the_price_are_done()
    {
        $user = User::factory()->create();
        $this->actingAs($user);
        $sellAuction = $this->makeSellAuction($user, ['auction_price' => '900000']);

        $sellAuction->user->notify(new DocumentNotSubmittedReminder($sellAuction));

        $this->assertCount(1, $this->documentNotifications($user));

        $this->post(route('auction.sell.documents', $sellAuction))->assertRedirect();

        $this->assertCount(0, $this->documentNotifications($user));
    }

    public function test_it_keeps_reminding_about_the_document_while_the_price_is_already_set()
    {
        $user = User::factory()->create();
        $this->actingAs($user);
        $sellAuction = $this->makeSellAuction($user, ['auction_price' => '900000']);

        $sellAuction->user->notify(new DocumentNotSubmittedReminder($sellAuction));

        $notifications = $this->documentNotifications($user);

        $this->assertCount(1, $notifications);
        $this->assertFalse($notifications[0]['document_submitted']);
        $this->assertTrue($notifications[0]['price_is_set']);
        $this->assertEquals(900000, $notifications[0]['price']);
    }

    public function test_the_reminder_does_not_treat_a_missing_price_as_zero()
    {
        $user = User::factory()->create();
        $sellAuction = $this->makeSellAuction($user);
        $payload = (new DocumentNotSubmittedReminder($sellAuction))->toArray($sellAuction->user);

        $this->assertNull($payload['auction_price']);
        $this->assertFalse($payload['document_submitted']);
    }
}
