<?php

namespace Database\Seeders;

use App\Models\CredsProgram;
use Illuminate\Database\Seeder;

class CredsProgramSeeder extends Seeder
{
    public function run(): void
    {
        CredsProgram::updateOrCreate(
            ['slug' => '30-day-fellowship'],
            [
                'name' => 'Fueler 30 Day Fellowship',
                'type' => 'fellowship',
                'description' => 'Fueler 30-Day Fellowship Program',
                'template' => 'default',
                'is_active' => true,
            ]
        );
    }
}