<?php

namespace App\Http\Resources;

use App\Models\Certificate;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;


class PublicCertificateResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $verificationStatus = $this->verificationStatus();

        return [
            'certificate_id' => $this->certificate_id,

            'recipient_name' => $this->recipient_name,

            'program' => [
                'name' => $this->program->name,
                'type' => $this->program->type,
            ],

            'issued_at' => $this->issued_at?->toDateString(),
            'expires_at' => $this->expires_at?->toDateString(),

            'status' => $verificationStatus,

            'verified' =>
                $verificationStatus === 'verified',

            'message' => match ($verificationStatus) {
                'verified' =>
                'Certificate verified successfully.',

                'revoked' =>
                'This certificate has been revoked.',

                'expired' =>
                'This certificate has expired.',
            },
        ];
    }

    private function verificationStatus(): string
    {
        if ($this->isRevoked()) {
            return 'revoked';
        }

        if (
            $this->expires_at !== null
            && $this->expires_at->lt(today())
        ) {
            return 'expired';
        }

        return 'verified';
    }
}