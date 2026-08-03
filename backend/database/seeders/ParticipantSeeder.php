<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class ParticipantSeeder extends Seeder
{
    /**
     * Seed 300 deterministic demo participants.
     *
     * The fixed email addresses make this seeder safe to run repeatedly.
     */
    public function run(): void
    {
        $firstNames = [
            'Aarav', 'Aditi', 'Akash', 'Ananya', 'Arjun',
            'Diya', 'Ishaan', 'Kavya', 'Meera', 'Neha',
            'Nikhil', 'Priya', 'Rahul', 'Riya', 'Rohan',
            'Saanvi', 'Siddharth', 'Tanvi', 'Varun', 'Zoya',
        ];

        $lastNames = [
            'Agarwal', 'Bansal', 'Chopra', 'Desai', 'Gupta',
            'Iyer', 'Jain', 'Kapoor', 'Khan', 'Mehta',
            'Nair', 'Patel', 'Rao', 'Shah', 'Verma',
        ];

        $password = Hash::make('password');
        $timestamp = now();
        $participants = [];
        $number = 1;

        foreach ($firstNames as $firstName) {
            foreach ($lastNames as $lastName) {
                $participants[] = [
                    'name' => "{$firstName} {$lastName}",
                    'email' => sprintf(
                        'participant%03d@demo.fueler.io',
                        $number
                    ),
                    'email_verified_at' => $timestamp,
                    'password' => $password,
                    'is_admin' => false,
                    'created_at' => $timestamp,
                    'updated_at' => $timestamp,
                ];

                $number++;
            }
        }

        DB::table('users')->upsert(
            $participants,
            ['email'],
            [
                'name',
                'email_verified_at',
                'password',
                'is_admin',
                'updated_at',
            ]
        );
    }
}
