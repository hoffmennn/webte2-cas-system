<?php

namespace App\Console\Commands;

use App\Models\ApiKey;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class IssueApiKey extends Command
{
    protected $signature = 'cas:issue-key {name : Label identifying who the key is for}';

    protected $description = 'Generate a new API key, store it in the api_keys table, and print it.';

    public function handle(): int
    {
        $name = $this->argument('name');
        $key  = Str::random(48);

        ApiKey::create([
            'name'   => $name,
            'key'    => $key,
            'active' => true,
        ]);

        $this->info("Issued API key for '{$name}':");
        $this->line($key);

        return self::SUCCESS;
    }
}
