<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('animation_stats', function (Blueprint $table) {
            $table->id();
            $table->string('animation_type', 50)->index();
            $table->string('cookie_token', 64)->index();
            $table->string('ip_address', 45)->nullable();
            $table->string('city', 100)->nullable();
            $table->string('country', 100)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('animation_stats');
    }
};
