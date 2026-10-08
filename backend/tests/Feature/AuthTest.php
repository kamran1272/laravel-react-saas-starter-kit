<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_returns_token_and_user(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'user' => ['id', 'name', 'email', 'role', 'email_verified_at', 'created_at', 'updated_at'],
                'token',
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
            'role' => 'user',
        ]);
    }

    public function test_register_cannot_self_assign_admin_role(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Sneaky User',
            'email' => 'sneaky@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'admin',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', [
            'email' => 'sneaky@example.com',
            'role' => 'user',
        ]);
    }

    public function test_login_returns_token_and_user(): void
    {
        User::factory()->create([
            'email' => 'login@example.com',
            'password' => 'secret123',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'login@example.com',
            'password' => 'secret123',
        ]);

        $response->assertOk()
            ->assertJsonStructure([
                'user' => ['id', 'name', 'email', 'role'],
                'token',
            ]);
    }

    public function test_login_with_wrong_password_returns_401(): void
    {
        User::factory()->create([
            'email' => 'login@example.com',
            'password' => 'secret123',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'login@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(401)
            ->assertJson(['message' => 'Invalid credentials']);
    }

    public function test_me_requires_authentication(): void
    {
        $this->getJson('/api/auth/me')->assertStatus(401);
    }

    public function test_me_without_accept_header_returns_json_401(): void
    {
        // Plain HTTP clients (cURL without -H Accept) must still get JSON 401,
        // not a 500 from Laravel's missing "login" route redirect.
        $response = $this->call('GET', '/api/auth/me', [], [], [], [
            'HTTP_ACCEPT' => '*/*',
        ]);

        $response->assertStatus(401);
        $this->assertEquals('application/json', $response->headers->get('Content-Type') ? explode(';', $response->headers->get('Content-Type'))[0] : '');
    }

    public function test_non_admin_cannot_list_users(): void
    {
        $user = User::factory()->create(['role' => 'user']);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/users')
            ->assertStatus(403)
            ->assertJson(['message' => 'Forbidden']);
    }

    public function test_admin_can_list_users(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        User::factory(3)->create();

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/users');

        $response->assertOk()
            ->assertJsonStructure(['data', 'meta', 'links'])
            ->assertJsonCount(4, 'data');
    }
}
