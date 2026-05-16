<?php

return [
    'api_key'             => env('CAS_API_KEY', 'changeme-set-in-env'),
    'slowdown_coefficient' => (float) env('CAS_SLOWDOWN_COEFFICIENT', 0),
    'stat_cooldown_minutes' => (int) env('CAS_STAT_COOLDOWN_MINUTES', 10),
    'octave_binary'       => env('CAS_OCTAVE_BINARY', '/usr/bin/octave'),
    'session_dir'         => env('CAS_SESSION_DIR', '/tmp'),
    'session_ttl_hours'   => (int) env('CAS_SESSION_TTL_HOURS', 24),
    'execution_timeout'   => (int) env('CAS_EXECUTION_TIMEOUT', 30),
];
