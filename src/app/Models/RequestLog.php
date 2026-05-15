<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RequestLog extends Model
{
    protected $fillable = [
        'api_key',
        'session_token',
        'endpoint',
        'command',
        'output',
        'is_error',
        'ip_address',
    ];

    protected $casts = ['is_error' => 'boolean'];
}
