<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class OctaveSession extends Model
{
    protected $fillable = ['session_token', 'last_used_at'];

    protected $casts = ['last_used_at' => 'datetime'];

    public static function touch(string $token): void
    {
        static::updateOrCreate(
            ['session_token' => $token],
            ['last_used_at' => Carbon::now()]
        );
    }

    public function getMatFilePath(): string
    {
        $safe = preg_replace('/[^a-zA-Z0-9]/', '', $this->session_token);

        return config('cas.session_dir', '/tmp') . '/cas_sess_' . $safe . '.mat';
    }
}
