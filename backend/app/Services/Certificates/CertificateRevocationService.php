<?php

namespace App\Services\Certificates;

use App\Enums\CertificateStatus;
use App\Models\Certificate;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CertificateRevocationService
{
    public function revoke(
        int $certificateId,
        int $adminId,
        string $reason
    ): Certificate {
        return DB::transaction(function () use ($certificateId, $adminId, $reason) {
            $certificate = Certificate::query()
                ->lockForUpdate() // same logic here, to prevent simultaneous revocation of the same same cert
                ->findOrFail($certificateId);

            if ($certificate->isRevoked()) {
                throw ValidationException::withMessages([
                    'certificate' =>
                        'This certificate has already been revoked.',
                ]);
            }

            $certificate->update([
                'status' => CertificateStatus::REVOKED,
                'revoked_at' => now(),
                'revoked_by' => $adminId,
                'revocation_reason' => $reason,
            ]);

            return $certificate->refresh();
        });
    }
}