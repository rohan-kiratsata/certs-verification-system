<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('certificates', function (Blueprint $table) {
            $table->id();
            $table->timestamps();

            $table->string('certificate_id')->unique();
            $table->foreignId('user_id')->constrained('users')->restrictOnDelete();


            $table->foreignId('creds_program_id')->constrained('creds_program')->restrictOnDelete();

            $table->string('recipient_name');
            $table->string('recipient_email');
            $table->string('status')->default('active');
            $table->date('issued_at');
            $table->date('expires_at')->nullable();
            $table->string('pdf_path')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->foreignId('revoked_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('revocation_reason')->nullable();
            $table->index(['user_id', 'creds_program_id', 'status']);
            $table->index('recipient_email');
            $table->index('issued_at');


            //**
            // learning:
            // referenceOnDelete - means it will refuse to delete a user/program while certs still reference it. point is to protect the certificate history
            // nullOnDelete - means if the revoking admin is removed baad mein, then the certificte remains revoked, but revoked_by becomes null
            //  */

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('certificates');
    }
};
