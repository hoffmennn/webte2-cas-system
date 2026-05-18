<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AnimationStat;
use Illuminate\Http\JsonResponse;

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
    public function index(): JsonResponse
    {
        return response()->json([
            'summary' => $this->summary(),
            'details' => $this->details(),
        ]);
    }

    private function summary(): array
    {
        return AnimationStat::query()
            ->get(['animation_type', 'cookie_token', 'created_at'])
            ->groupBy('animation_type')
            ->map(fn ($rows, $type) => [
                'animation_type'  => $type,
                'total_runs'      => $rows->count(),
                'unique_visitors' => $rows->pluck('cookie_token')->unique()->count(),
                'last_used_at'    => $rows->pluck('created_at')->max()?->toIso8601String(),
            ])
            ->sortKeys()
            ->values()
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
