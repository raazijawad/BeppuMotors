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

    public function test_invoices_start_from_the_bill_number_starting_value_and_increment()
    {
        $user = User::factory()->create();
        $customer = $user->customers()->create([
            'name' => 'Tanaka Auto',
            'bill_prefix' => 'TYN0005',
        ]);
        $stock = $user->stocks()->create(['name' => 'Corolla']);

        $this->actingAs($user);

        foreach (['TYN0005', 'TYN0006', 'TYN0007'] as $expected) {
            $this->post(route('customers.invoices.store', $customer), [
                'lines' => [['stock_id' => $stock->id, 'amount' => 100]],
                'date' => '2026-10-06',
            ])->assertRedirect();

            $this->assertDatabaseHas('invoices', [
                'customer_id' => $customer->id,
                'bill_number' => $expected,
            ]);
        }
    }

    public function test_prefix_only_bill_number_starting_keeps_generating_padded_numbers()
    {
        $user = User::factory()->create();
        $customer = $user->customers()->create([
            'name' => 'Tanaka Auto',
            'bill_prefix' => 'TYN',
        ]);
        $stock = $user->stocks()->create(['name' => 'Corolla']);

        $this->actingAs($user);

        foreach (['TYN0001', 'TYN0002'] as $expected) {
            $this->post(route('customers.invoices.store', $customer), [
                'lines' => [['stock_id' => $stock->id, 'amount' => 100]],
                'date' => '2026-10-06',
            ])->assertRedirect();

            $this->assertDatabaseHas('invoices', [
                'customer_id' => $customer->id,
                'bill_number' => $expected,
            ]);
        }
    }

    public function test_next_bill_number_continues_after_the_highest_existing_number()
    {
        $user = User::factory()->create();
        $customer = $user->customers()->create([
            'name' => 'Tanaka Auto',
            'bill_prefix' => 'TYN0005',
        ]);
        $stock = $user->stocks()->create(['name' => 'Corolla']);

        $customer->invoices()->create([
            'user_id' => $user->id,
            'stock_id' => $stock->id,
            'amount' => 100,
            'date' => '2026-10-01',
            'sale_id' => 'existing-sale',
            'bill_number' => 'TYN0009',
        ]);

        $this->actingAs($user);

        $this->post(route('customers.invoices.store', $customer), [
            'lines' => [['stock_id' => $stock->id, 'amount' => 100]],
            'date' => '2026-10-06',
        ])->assertRedirect();

        $this->assertDatabaseHas('invoices', [
            'customer_id' => $customer->id,
            'bill_number' => 'TYN0010',
        ]);
    }

    public function test_legacy_bill_numbers_are_converted_to_the_new_format()
    {
        $user = User::factory()->create();
        $customer = $user->customers()->create([
            'name' => 'Tanaka Auto',
            'bill_prefix' => 'AK003',
        ]);
        $stock = $user->stocks()->create(['name' => 'Corolla']);

        $customer->invoices()->create([
            'user_id' => $user->id,
            'stock_id' => $stock->id,
            'amount' => 100,
            'date' => '2026-10-01',
            'sale_id' => 'sale-1',
            'bill_number' => 'AK003001',
        ]);
        $customer->invoices()->create([
            'user_id' => $user->id,
            'stock_id' => $stock->id,
            'amount' => 200,
            'date' => '2026-10-02',
            'sale_id' => 'sale-2',
            'bill_number' => 'AK003002',
        ]);

        $migration = require database_path('migrations/2026_10_10_000001_convert_legacy_bill_numbers.php');
        $migration->up();

        $this->assertDatabaseHas('invoices', [
            'customer_id' => $customer->id,
            'sale_id' => 'sale-1',
            'bill_number' => 'AK003',
        ]);
        $this->assertDatabaseHas('invoices', [
            'customer_id' => $customer->id,
            'sale_id' => 'sale-2',
            'bill_number' => 'AK004',
        ]);

        $this->actingAs($user);

        $this->post(route('customers.invoices.store', $customer), [
            'lines' => [['stock_id' => $stock->id, 'amount' => 100]],
            'date' => '2026-10-06',
        ])->assertRedirect();

        $this->assertDatabaseHas('invoices', [
            'customer_id' => $customer->id,
            'bill_number' => 'AK005',
        ]);
    }

    public function test_legacy_conversion_leaves_prefix_only_numbers_unchanged()
    {
        $user = User::factory()->create();
        $customer = $user->customers()->create([
            'name' => 'Tanaka Auto',
            'bill_prefix' => 'TYN',
        ]);
        $stock = $user->stocks()->create(['name' => 'Corolla']);

        $customer->invoices()->create([
            'user_id' => $user->id,
            'stock_id' => $stock->id,
            'amount' => 100,
            'date' => '2026-10-01',
            'sale_id' => 'sale-1',
            'bill_number' => 'TYN0001',
        ]);

        $migration = require database_path('migrations/2026_10_10_000001_convert_legacy_bill_numbers.php');
        $migration->up();

        $this->assertDatabaseHas('invoices', [
            'customer_id' => $customer->id,
            'bill_number' => 'TYN0001',
        ]);
    }
}
