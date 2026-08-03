<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::updateOrCreate(
            ['email' => 'admin@fueler.io'],
            [
                'name' => 'Fueler Admin',
                'email_verified_at' => now(),
                'password' => 'password',
                'is_admin' => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'participant@example.io'],
            [
                'name' => 'Fueler Participant',
                'email_verified_at' => now(),
                'password' => 'password',
                'is_admin' => false,
            ]
        );

        $this->call([
            ParticipantSeeder::class,
            CredsProgramSeeder::class,
        ]);
    }
}
