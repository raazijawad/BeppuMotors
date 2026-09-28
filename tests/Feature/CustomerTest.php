<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_users_can_create_a_customer()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->post(route('customers.store'), [
            'name' => 'Tanaka Auto',
            'bill_prefix' => 'TYN',
            'phone' => '0977-76-7035',
            'address' => 'Oita-Ken, Beppu Shi',
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('customers', [
            'user_id' => $user->id,
            'name' => 'Tanaka Auto',
            'bill_prefix' => 'TYN',
            'phone' => '0977-76-7035',
            'address' => 'Oita-Ken, Beppu Shi',
        ]);
    }

    public function test_customer_details_can_be_edited()
    {
        $user = User::factory()->create();
        $customer = $user->customers()->create([
            'name' => 'Tanaka Auto',
            'bill_prefix' => 'TYN',
            'phone' => '0977-76-7035',
            'address' => 'Oita-Ken, Beppu Shi',
        ]);

        $this->actingAs($user);

        $response = $this->put(route('customers.update', $customer), [
            'name' => 'Tanaka Motors',
            'bill_prefix' => 'TAN',
            'phone' => '0000-11-2233',
            'address' => 'Tokyo, Shibuya',
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'name' => 'Tanaka Motors',
            'bill_prefix' => 'TAN',
            'phone' => '0000-11-2233',
            'address' => 'Tokyo, Shibuya',
        ]);
    }

    public function test_editing_a_customer_requires_a_name_and_bill_prefix()
    {
        $user = User::factory()->create();
        $customer = $user->customers()->create([
            'name' => 'Tanaka Auto',
            'bill_prefix' => 'TYN',
        ]);

        $this->actingAs($user);

        $this->put(route('customers.update', $customer), [
            'name' => '',
            'bill_prefix' => '',
        ])->assertSessionHasErrors(['name', 'bill_prefix']);

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'name' => 'Tanaka Auto',
        ]);
    }

    public function test_customer_index_exposes_editable_details()
    {
        $user = User::factory()->create();
        $user->customers()->create([
            'name' => 'Tanaka Auto',
            'bill_prefix' => 'TYN',
            'phone' => '0977-76-7035',
            'address' => 'Oita-Ken, Beppu Shi',
        ]);

        $this->actingAs($user);

        $this->get(route('customer'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('customers.0.name', 'Tanaka Auto')
                ->where('customers.0.bill_prefix', 'TYN')
                ->where('customers.0.phone', '0977-76-7035')
                ->where('customers.0.address', 'Oita-Ken, Beppu Shi')
            );
    }

    public function test_guests_cannot_edit_customers()
    {
        $user = User::factory()->create();
        $customer = $user->customers()->create([
            'name' => 'Tanaka Auto',
            'bill_prefix' => 'TYN',
        ]);

        $this->put(route('customers.update', $customer), [
            'name' => 'Hacked',
            'bill_prefix' => 'HACK',
        ])->assertRedirect(route('login'));

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'name' => 'Tanaka Auto',
        ]);
    }
}
