<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AnimationStat extends Model
{
    protected $fillable = [
        'animation_type',
        'cookie_token',
        'ip_address',
        'city',
        'country',
    ];

    /**
     * Returns true if the given user has NOT used this animation within the cooldown window,
     * meaning we should count this as a new use.
     */
    public static function canCount(string $cookieToken, string $animationType): bool
    {
        $cooldown = config('cas.stat_cooldown_minutes', 10);

        return ! static::where('cookie_token', $cookieToken)
            ->where('animation_type', $animationType)
            ->where('created_at', '>=', now()->subMinutes($cooldown))
            ->exists();
    }
}
