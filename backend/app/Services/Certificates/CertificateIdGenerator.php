<?php

namespace App\Services\Certificates;

use App\Models\Certificate;
use Illuminate\Support\Str;

// generates unique certificate id for each certificate issued.
// example : FLR-12-ABCD123
class CertificateIdGenerator
{
    public function generate(): string
    {
        do {
            $certificateId = sprintf(
                'FLR-%s-%s',
                now()->format('y'),
                Str::upper(Str::random(7))
            );
            // avoiding duplicate ids
        } while (
            Certificate::query()
                ->where('certificate_id', $certificateId)
                ->exists()
        );

        return $certificateId;
    }
}


