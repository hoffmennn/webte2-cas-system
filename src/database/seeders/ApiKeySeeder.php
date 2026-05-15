<?php

namespace Database\Seeders;

use App\Models\ApiKey;
use Illuminate\Database\Seeder;

class ApiKeySeeder extends Seeder
{
    public function run(): void
    {
        ApiKey::firstOrCreate(
            ['key' => config('cas.api_key')],
            ['name' => 'Default Key (from config)', 'active' => true]
        );
    }
}
