<?php

namespace App\Http\Middleware;

use App\Models\ApiKey;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApiKeyAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $this->extractToken($request);

        if (! $token) {
            return response()->json(['error' => 'API key required.'], 401);
        }

        // Accept the key defined in the config file
        if ($token === config('cas.api_key')) {
            return $next($request);
        }

        // Accept any active key stored in the database
        if (ApiKey::isValid($token)) {
            return $next($request);
        }

        return response()->json(['error' => 'Invalid or inactive API key.'], 401);
    }

    private function extractToken(Request $request): ?string
    {
        // Authorization: Bearer <token>
        $auth = $request->header('Authorization', '');
        if (str_starts_with($auth, 'Bearer ')) {
            return substr($auth, 7);
        }

        // X-API-Key: <token>
        if ($key = $request->header('X-API-Key')) {
            return $key;
        }

        // Body / query param (last resort)
        return $request->input('api_key');
    }
}
