<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AnimationStat;
use App\Models\RequestLog;
use App\Services\OctaveService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AnimationController extends Controller
{
    public function __construct(private OctaveService $octave) {}

    /**
     * POST /api/animate/inverted-pendulum
     * Accepted params: M, m, b, I, l, theta0, dt, tmax
     */
    public function invertedPendulum(Request $request): JsonResponse
    {
        $params = $request->validate([
            'M'      => 'nullable|numeric|min:0.1|max:10',
            'm'      => 'nullable|numeric|min:0.01|max:5',
            'b'      => 'nullable|numeric|min:0|max:10',
            'I'      => 'nullable|numeric|min:0.001|max:1',
            'l'      => 'nullable|numeric|min:0.05|max:2',
            'theta0' => 'nullable|numeric|min:-0.5|max:0.5',
            'dt'     => 'nullable|numeric|min:0.01|max:0.1',
            'tmax'   => 'nullable|numeric|min:1|max:20',
        ]);

        $result = $this->octave->computeInvertedPendulum($params);

        $this->logRequest($request, 'animate/inverted-pendulum', $params, $result);
        $this->recordStat($request, 'inverted_pendulum');

        return $this->buildAnimationResponse($result, ['t', 'x', 'x_dot', 'theta', 'theta_dot']);
    }

    /**
     * POST /api/animate/ball-beam
     * Accepted params: m, R, d, L, J, r0, dt, tmax
     */
    public function ballBeam(Request $request): JsonResponse
    {
        $params = $request->validate([
            'm'    => 'nullable|numeric|min:0.001|max:5',
            'R'    => 'nullable|numeric|min:0.001|max:0.5',
            'd'    => 'nullable|numeric|min:0.001|max:0.5',
            'L'    => 'nullable|numeric|min:0.1|max:5',
            'J'    => 'nullable|numeric|min:1.0e-9|max:0.01',
            'r0'   => 'nullable|numeric|min:-1|max:1',
            'dt'   => 'nullable|numeric|min:0.01|max:0.1',
            'tmax' => 'nullable|numeric|min:1|max:20',
        ]);

        $result = $this->octave->computeBallBeam($params);

        $this->logRequest($request, 'animate/ball-beam', $params, $result);
        $this->recordStat($request, 'ball_beam');

        return $this->buildAnimationResponse($result, ['t', 'r', 'r_dot', 'alpha', 'alpha_dot']);
    }

    // -------------------------------------------------------------------------

    private function buildAnimationResponse(array $result, array $columns): JsonResponse
    {
        if (! $result['success']) {
            return response()->json([
                'error'   => 'Octave computation failed.',
                'details' => $result['error'],
            ], 500);
        }

        $data = json_decode($result['output'], true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            return response()->json([
                'error' => 'Could not parse Octave output.',
                'raw'   => $result['output'],
            ], 500);
        }

        return response()->json([
            'data'    => $data,
            'columns' => $columns,
            'success' => true,
        ]);
    }

    private function logRequest(Request $request, string $endpoint, array $params, array $result): void
    {
        RequestLog::create([
            'api_key'       => $this->resolveApiKey($request),
            'session_token' => null,
            'endpoint'      => $endpoint,
            'command'       => json_encode($params),
            'output'        => $result['success']
                ? 'OK (' . strlen($result['output']) . ' bytes)'
                : trim($result['error']),
            'is_error'      => ! $result['success'],
            'ip_address'    => $request->ip(),
        ]);
    }

    private function recordStat(Request $request, string $type): void
    {
        $token = $request->cookie('cas_visitor') ?? Str::uuid()->toString();

        if (AnimationStat::canCount($token, $type)) {
            $geo = $this->resolveGeo($request->ip());

            AnimationStat::create([
                'animation_type' => $type,
                'cookie_token'   => $token,
                'ip_address'     => $request->ip(),
                'city'           => $geo['city'],
                'country'        => $geo['country'],
            ]);
        }
    }

    /**
     * Free IP geolocation via ip-api.com (no key required, rate-limited to 45 req/min).
     * Returns ['city' => ..., 'country' => ...] or nulls on failure.
     */
    private function resolveGeo(string $ip): array
    {
        // Skip for private/loopback addresses
        if (in_array($ip, ['127.0.0.1', '::1']) || str_starts_with($ip, '192.168.') || str_starts_with($ip, '10.')) {
            return ['city' => null, 'country' => null];
        }

        try {
            $json = @file_get_contents("http://ip-api.com/json/{$ip}?fields=city,country,status");
            if ($json) {
                $data = json_decode($json, true);
                if (($data['status'] ?? '') === 'success') {
                    return ['city' => $data['city'] ?? null, 'country' => $data['country'] ?? null];
                }
            }
        } catch (\Throwable) {
            // Geo lookup is best-effort; never block the request
        }

        return ['city' => null, 'country' => null];
    }

    private function resolveApiKey(Request $request): ?string
    {
        $auth = $request->header('Authorization', '');
        if (str_starts_with($auth, 'Bearer ')) {
            return substr($auth, 7);
        }

        return $request->header('X-API-Key') ?? $request->input('api_key');
    }
}
