<?php

namespace App\Http\Controllers\Api;

use App\Models\RequestLog;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LogController
{
    private const CSV_COLUMNS = [
        'id',
        'created_at',
        'endpoint',
        'session_token',
        'api_key_tail',
        'command',
        'output_truncated',
        'is_error',
        'ip_address',
    ];

    private const OUTPUT_PREVIEW_LENGTH = 500;

    /**
     * GET /api/logs/export — stream request_logs as CSV (REQ 9).
     * API key never appears in full; only the last 4 characters are exposed.
     */
    public function export(Request $request): StreamedResponse
    {
        $filename = 'cas_logs_' . now()->format('Y-m-d') . '.csv';

        return response()->stream(function () {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, self::CSV_COLUMNS);

            foreach (RequestLog::query()->orderBy('created_at')->cursor() as $log) {
                fputcsv($handle, $this->rowFor($log));
            }

            fclose($handle);
        }, 200, [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    private function rowFor(RequestLog $log): array
    {
        return [
            $log->id,
            $log->created_at?->toIso8601String(),
            $log->endpoint,
            $log->session_token,
            $this->maskApiKey($log->api_key),
            $log->command,
            Str::limit((string) $log->output, self::OUTPUT_PREVIEW_LENGTH, '…'),
            $log->is_error ? '1' : '0',
            $log->ip_address,
        ];
    }

    private function maskApiKey(?string $apiKey): string
    {
        if (! $apiKey) {
            return '';
        }

        return '***' . substr($apiKey, -4);
    }
}
