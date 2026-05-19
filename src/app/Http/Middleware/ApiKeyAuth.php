<?php

namespace App\Http\Middleware;

use App\Http\Controllers\Api\Concerns\ResolvesApiKey;
use App\Models\ApiKey;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApiKeyAuth
{
    use ResolvesApiKey;

    public function handle(Request $request, Closure $next): Response
    {
        $token = $this->resolveApiKey($request);

        if (! $token) {
            return response()->json(['error' => 'API key required.'], 401);
        }

        if ($token === config('cas.api_key')) {
            return $next($request);
        }

        if (ApiKey::isValid($token)) {
            return $next($request);
        }

        return response()->json(['error' => 'Invalid or inactive API key.'], 401);
    }
}
