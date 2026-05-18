<?php

namespace App\Http\Controllers;

use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;
use Symfony\Component\Yaml\Yaml;

class DocsController extends Controller
{
    private const SPEC_PATH = 'api-docs/openapi.yaml';

    /**
     * GET /api/openapi.yaml — serve the raw OpenAPI YAML so Swagger UI on
     * the frontend can render it. Public; the API docs themselves don't
     * leak any secrets.
     */
    public function spec(): Response
    {
        $yaml = file_get_contents(resource_path(self::SPEC_PATH));

        return response($yaml, 200, [
            'Content-Type' => 'application/yaml; charset=utf-8',
        ]);
    }

    /**
     * GET /docs.pdf — render the same spec as a PDF on demand. dompdf's
     * inline `<script type="text/php">` hook (enabled via `isPhpEnabled`)
     * stamps `Page X / Y` in the footer of every page.
     */
    public function pdf(): HttpResponse
    {
        $spec = Yaml::parseFile(resource_path(self::SPEC_PATH));

        $pdf = Pdf::loadView('docs.pdf', ['spec' => $spec])
            ->setPaper('a4')
            ->setOption('isPhpEnabled', true)
            ->setOption('defaultFont', 'DejaVu Sans');

        return $pdf->stream('cas-api-docs.pdf');
    }
}
