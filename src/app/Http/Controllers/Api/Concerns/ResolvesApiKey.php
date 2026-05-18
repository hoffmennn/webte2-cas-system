<?php

namespace App\Http\Controllers\Api\Concerns;

use Illuminate\Http\Request;

trait ResolvesApiKey
{
    private function resolveApiKey(Request $request): ?string
    {
        $auth = $request->header('Authorization', '');
        if (str_starts_with($auth, 'Bearer ')) {
            return substr($auth, 7);
        }

        return $request->header('X-API-Key') ?? $request->input('api_key');
    }
}
