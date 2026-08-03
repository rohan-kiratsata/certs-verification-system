<?php

namespace App\Services\Certificates;


use App\Enums\CertificateStatus;
use App\Models\Certificate;
use App\Models\CredsProgram;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;


class CertificateIssuanceService
{

    public function __construct(
        private CertificateIdGenerator $idGenerator,
    ) {
    }

    public function issue(int $userId, int $programId, CarbonInterface $issuedAt, ?CarbonInterface $expiresAt = null): Certificate
    {
        return DB::transaction(function () use ($userId, $programId, $issuedAt, $expiresAt, ) {
            $user = User::query()->lockForUpdate()->findOrFail($userId);
            $program = CredsProgram::query()->findOrFail($programId);

            // if program is active thorw error
            if (!$program->is_active) {
                throw ValidationException::withMessages(
                    [
                        'creds_program_id' => 'Certificate cannot be issued for inactive program.',
                    ]
                );
            }

            $alreadyIssued = Certificate::query()
                ->where('user_id', $userId)
                ->where('creds_program_id', $programId)
                ->where('status', CertificateStatus::ACTIVE->value)
                ->exists();

            if ($alreadyIssued) {
                throw ValidationException::withMessages([
                    'user_id' =>
                        'This user already has an active certificate for this program.',
                ]);
            }
            return Certificate::query()->create([
                'certificate_id' =>
                    $this->idGenerator->generate(),

                'user_id' => $user->id,
                'creds_program_id' => $program->id,

                'recipient_name' => $user->name,
                'recipient_email' => $user->email,

                'status' => CertificateStatus::ACTIVE,

                'issued_at' => $issuedAt,
                'expires_at' => $expiresAt,
            ]);

        });


        // lockforUpdate - if two admin requests arrive simultaneously for same user. without lock would create duplicate entries. with lock, second request will wait for first to complete and then check if already issued and throw error.
    }
}
