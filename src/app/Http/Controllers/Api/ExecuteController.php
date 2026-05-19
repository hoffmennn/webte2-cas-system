<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesApiKey;
use App\Models\OctaveSession;
use App\Models\RequestLog;
use App\Services\OctaveService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ExecuteController
{
    use ResolvesApiKey;

    public function __construct(private OctaveService $octave) {}

    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'command'       => 'required|string|max:10000',
            'session_token' => 'nullable|string|max:64',
        ]);

        $command      = $validated['command'];
        $sessionToken = $validated['session_token'] ?? Str::random(32);

        OctaveSession::touchSession($sessionToken);

        $result = $this->octave->execute($command, $sessionToken);

        RequestLog::create([
            'api_key'       => $this->resolveApiKey($request),
            'session_token' => $sessionToken,
            'endpoint'      => 'execute',
            'command'       => $command,
            'output'        => trim($result['output'] . ($result['error'] ? "\n[stderr] " . $result['error'] : '')),
            'is_error'      => ! $result['success'],
            'ip_address'    => $request->ip(),
        ]);

        $cleanError = OctaveService::filterStderr($result['error'] ?? '');

        return response()->json([
            'output'        => $result['output'],
            'error'         => $cleanError ?: null,
            'success'       => $result['success'],
            'session_token' => $sessionToken,
        ], $result['success'] ? 200 : 422);
    }

}
