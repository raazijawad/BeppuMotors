<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserApprovalTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_admins_can_not_access_the_admin_users_page()
    {
        $employee = User::factory()->create();

        $this->actingAs($employee)
            ->get(route('admin.users'))
            ->assertForbidden();
    }

    public function test_admins_can_view_pending_user_requests()
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $pending = User::factory()->create(['status' => User::STATUS_PENDING]);

        $this->actingAs($admin)
            ->get(route('admin.users'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('admin/users')
                ->has('users', 2)
                ->where('pendingCount', 1)
                ->where('users.0.id', $pending->id)
                ->where('users.0.status', User::STATUS_PENDING));
    }

    public function test_admin_can_approve_a_pending_user()
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $user = User::factory()->create(['status' => User::STATUS_PENDING]);

        $this->actingAs($admin)
            ->post(route('admin.users.approve', $user))
            ->assertRedirect();

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'status' => User::STATUS_ACTIVE,
        ]);
    }

    public function test_admin_can_reject_a_pending_user()
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $user = User::factory()->create(['status' => User::STATUS_PENDING]);

        $this->actingAs($admin)
            ->post(route('admin.users.reject', $user))
            ->assertRedirect();

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'status' => User::STATUS_REJECTED,
        ]);
    }

    public function test_approved_user_can_log_in()
    {
        $user = User::factory()->create(['status' => User::STATUS_ACTIVE]);

        $this->post(route('login.store'), [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
    }
}
