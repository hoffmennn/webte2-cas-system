<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AnimationStat;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class StatsController extends Controller
{
    private const DETAILS_LIMIT = 100;

    /**
     * GET /api/stats — aggregated animation usage (REQ 11).
     *
     * Schema mapping: the underlying `animation_stats` table uses `cookie_token`
     * for the anonymous visitor identifier and Laravel's `created_at` timestamp
     * for the moment of use. The JSON response exposes these as
     * `unique_visitors` and `used_at` respectively (without leaking the token).
     */
    public function index(Request $request): JsonResponse
    {
        return response()->json([
            'summary' => $this->summary(),
            'details' => $this->details(),
        ]);
    }

    private function summary(): array
    {
        return AnimationStat::query()
            ->selectRaw('animation_type, COUNT(*) AS total_runs, COUNT(DISTINCT cookie_token) AS unique_visitors, MAX(created_at) AS last_used_at')
            ->groupBy('animation_type')
            ->orderBy('animation_type')
            ->get()
            ->map(fn ($row) => [
                'animation_type'  => $row->animation_type,
                'total_runs'      => (int) $row->total_runs,
                'unique_visitors' => (int) $row->unique_visitors,
                'last_used_at'    => $row->last_used_at ? Carbon::parse($row->last_used_at)->toIso8601String() : null,
            ])
            ->all();
    }

    private function details(): array
    {
        return AnimationStat::query()
            ->orderByDesc('created_at')
            ->limit(self::DETAILS_LIMIT)
            ->get(['animation_type', 'created_at', 'city', 'country'])
            ->map(fn ($row) => [
                'animation_type' => $row->animation_type,
                'used_at'        => $row->created_at?->toIso8601String(),
                'city'           => $row->city,
                'country'        => $row->country,
            ])
            ->all();
    }
}
