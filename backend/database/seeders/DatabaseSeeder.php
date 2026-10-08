<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * Idempotent: safe to run on every deploy/restart. Existing records
     * are left untouched; only missing demo data is created.
     */
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@demo.io'],
            [
                'name' => 'Admin',
                'password' => 'password',
                'role' => 'admin',
            ]
        );

        // Top the demo users up to 9 total (1 admin + 8 users).
        $missing = 9 - User::count();
        if ($missing > 0) {
            User::factory($missing)->create();
        }
    }
}
