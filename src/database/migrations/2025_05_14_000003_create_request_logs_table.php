<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('request_logs', function (Blueprint $table) {
            $table->id();
            $table->string('api_key', 64)->nullable();
            $table->string('session_token', 64)->nullable()->index();
            $table->string('endpoint', 100);
            $table->text('command');
            $table->longText('output')->nullable();
            $table->boolean('is_error')->default(false);
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('request_logs');
    }
};
