<?php

namespace App\Http\Resources\Admin;

use App\Models\Certificate;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Certificate */
class CertificateResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'certificate_id' => $this->certificate_id,

            'recipient' => [
                'name' => $this->recipient_name,
                'email' => $this->recipient_email,
            ],

            'status' => $this->status->value,

            'issued_at' => $this->issued_at?->toDateString(),
            'expires_at' => $this->expires_at?->toDateString(),

            'pdf_path' => $this->pdf_path,

            'revoked_at' => $this->revoked_at?->toIso8601String(),

            'revocation_reason' => $this->revocation_reason,

            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ],

            'program' => [
                'id' => $this->program->id,
                'name' => $this->program->name,
                'type' => $this->program->type,
            ],

            'revoked_by' => $this->whenLoaded(
                'revokedBy',
                function () {
                    if (! $this->revokedBy) {
                        return null;
                    }

                    return [
                        'id' => $this->revokedBy->id,
                        'name' => $this->revokedBy->name,
                        'email' => $this->revokedBy->email,
                    ];
                }
            ),

            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
