<?php

use App\Http\Controllers\Api\AnimationController;
use App\Http\Controllers\Api\ExecuteController;
use Illuminate\Support\Facades\Route;

Route::middleware('api.key')->group(function () {
    // General-purpose Octave command execution (session-aware)
    Route::post('/execute', ExecuteController::class);

    // Animation simulations
    Route::post('/animate/inverted-pendulum', [AnimationController::class, 'invertedPendulum']);
    Route::post('/animate/ball-beam',         [AnimationController::class, 'ballBeam']);
});
