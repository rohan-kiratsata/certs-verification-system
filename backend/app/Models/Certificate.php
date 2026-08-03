<?php

namespace App\Models;

use App\Enums\CertificateStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Certificate extends Model
{
    protected $fillable = [
        'certificate_id',
        'user_id',
        'creds_program_id',
        'recipient_name',
        'recipient_email',
        'status',
        'issued_at',
        'expires_at',
        'pdf_path',
        'revoked_at',
        'revoked_by',
        'revocation_reason',
    ];

    protected function casts(): array
    {
        return [
            'status' => CertificateStatus::class,
            'issued_at' => 'date',
            'expires_at' => 'date',
            'revoked_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(
            CredsProgram::class,
            'creds_program_id'
        );
    }

    public function revokedBy(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'revoked_by'
        );
    }

    public function isActive(): bool
    {
        return $this->status === CertificateStatus::ACTIVE;
    }

    public function isRevoked(): bool
    {
        return $this->status === CertificateStatus::REVOKED;
    }
}
