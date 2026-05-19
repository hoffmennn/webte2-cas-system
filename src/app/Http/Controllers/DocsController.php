<?php

namespace App\Http\Controllers;

use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;
use Symfony\Component\Yaml\Yaml;

class DocsController
{
    private const SUPPORTED_LANGS = ['en', 'sk'];
    private const DEFAULT_LANG = 'en';

    private const SPEC_PATHS = [
        'en' => 'api-docs/openapi.yaml',
        'sk' => 'api-docs/openapi.sk.yaml',
    ];

    /**
     * GET /api/openapi.yaml?lang=en|sk — serve the raw OpenAPI YAML so
     * Swagger UI on the frontend can render it. Public; the API docs
     * themselves don't leak any secrets.
     */
    public function spec(Request $request): Response
    {
        $lang = $this->resolveLang($request);
        $yaml = file_get_contents(resource_path(self::SPEC_PATHS[$lang]));

        return response($yaml, 200, [
            'Content-Type' => 'application/yaml; charset=utf-8',
        ]);
    }

    /**
     * GET /docs.pdf?lang=en|sk — render the same spec as a PDF on demand.
     * dompdf's inline `<script type="text/php">` hook (enabled via
     * `isPhpEnabled`) stamps `Page X / Y` in the footer of every page.
     */
    public function pdf(Request $request): HttpResponse
    {
        $lang = $this->resolveLang($request);
        $spec = Yaml::parseFile(resource_path(self::SPEC_PATHS[$lang]));

        $pdf = Pdf::loadView('docs.pdf', [
            'spec'   => $spec,
            'lang'   => $lang,
            'labels' => $this->pdfLabels($lang),
        ])
            ->setPaper('a4')
            ->setOption('isPhpEnabled', true)
            ->setOption('defaultFont', 'DejaVu Sans');

        return $pdf->stream("cas-api-docs.{$lang}.pdf");
    }

    private function resolveLang(Request $request): string
    {
        $lang = strtolower((string) $request->query('lang', self::DEFAULT_LANG));

        return in_array($lang, self::SUPPORTED_LANGS, true) ? $lang : self::DEFAULT_LANG;
    }

    /**
     * Static-string translations used by the PDF Blade template. Keeping
     * them here (rather than in lang files) so the docs feature is fully
     * self-contained — one controller, two YAMLs, one Blade view.
     */
    private function pdfLabels(string $lang): array
    {
        $labels = [
            'en' => [
                'version'       => 'Version',
                'generated'     => 'Generated',
                'servers'       => 'Servers',
                'auth'          => 'Authentication',
                'auth_type'     => 'Type:',
                'auth_in'       => 'in',
                'auth_named'    => 'named',
                'request_body'  => 'Request body',
                'responses'     => 'Responses',
                'col_field'     => 'Field',
                'col_type'      => 'Type',
                'col_constr'    => 'Constraints',
                'col_desc'      => 'Description',
                'col_status'    => 'Status',
                'col_content'   => 'Content type',
                'footer_note'   => 'Generated dynamically from resources/api-docs/openapi.yaml. Any change to that file is reflected in the next PDF render.',
                'page'          => 'Page',
            ],
            'sk' => [
                'version'       => 'Verzia',
                'generated'     => 'Vygenerované',
                'servers'       => 'Servery',
                'auth'          => 'Autentifikácia',
                'auth_type'     => 'Typ:',
                'auth_in'       => 'v',
                'auth_named'    => 's názvom',
                'request_body'  => 'Telo požiadavky',
                'responses'     => 'Odpovede',
                'col_field'     => 'Pole',
                'col_type'      => 'Typ',
                'col_constr'    => 'Obmedzenia',
                'col_desc'      => 'Popis',
                'col_status'    => 'Stav',
                'col_content'   => 'Typ obsahu',
                'footer_note'   => 'Generované dynamicky zo súboru resources/api-docs/openapi.sk.yaml. Akákoľvek zmena tohto súboru sa prejaví pri ďalšom vykreslení PDF.',
                'page'          => 'Strana',
            ],
        ];

        return $labels[$lang];
    }
}
