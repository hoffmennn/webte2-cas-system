<?php

use App\Http\Controllers\DocsController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Public docs (REQ 10) — OpenAPI spec + dynamically generated PDF.
Route::get('/api/openapi.yaml', [DocsController::class, 'spec'])->name('docs.spec');
Route::get('/docs.pdf',          [DocsController::class, 'pdf'])->name('docs.pdf');
