<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminPanelApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_an_admin_can_sign_in_and_access_admin_lookups(): void
    {
        $admin = User::factory()->create([
            'email' => 'admin@fueler.io',
            'password' => 'password',
            'is_admin' => true,
        ]);

        $login = $this->postJson('/api/admin/login', [
            'email' => $admin->email,
            'password' => 'password',
        ]);

        $login
            ->assertOk()
            ->assertJsonPath('user.email', 'admin@fueler.io')
            ->assertJsonStructure(['token']);

        $this
            ->withToken($login->json('token'))
            ->getJson('/api/admin/programs')
            ->assertOk()
            ->assertJsonStructure(['data']);
    }

    public function test_a_non_admin_cannot_sign_in_to_the_admin_panel(): void
    {
        $user = User::factory()->create([
            'password' => 'password',
            'is_admin' => false,
        ]);

        $this->postJson('/api/admin/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertUnprocessable();
    }
}
