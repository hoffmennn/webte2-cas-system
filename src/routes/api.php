<?php

use App\Http\Controllers\Api\AnimationController;
use App\Http\Controllers\Api\ExecuteController;
use App\Http\Controllers\Api\LogController;
use Illuminate\Support\Facades\Route;

Route::middleware('api.key')->group(function () {
    // Lightweight liveness check used by the frontend to verify the API key.
    Route::get('/ping', fn () => response()->json(['ok' => true]));

    // General-purpose Octave command execution (session-aware)
    Route::post('/execute', ExecuteController::class);

    // Animation simulations
    Route::post('/animate/inverted-pendulum', [AnimationController::class, 'invertedPendulum']);
    Route::post('/animate/ball-beam',         [AnimationController::class, 'ballBeam']);

    // CSV export of request logs (REQ 9)
    Route::get('/logs/export', [LogController::class, 'export']);
});
