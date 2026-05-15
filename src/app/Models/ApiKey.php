<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApiKey extends Model
{
    protected $fillable = ['name', 'key', 'active'];

    protected $casts = ['active' => 'boolean'];

    public static function isValid(string $key): bool
    {
        return static::where('key', $key)->where('active', true)->exists();
    }
}
