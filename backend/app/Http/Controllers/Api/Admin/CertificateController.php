<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\IssueCertificateRequest;
use App\Services\Certificates\CertificateIssuanceService;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use App\Http\Requests\ListCertificatesRequest;
use App\Http\Resources\Admin\CertificateResource;
use App\Models\Certificate;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use App\Http\Requests\RevokeCertificateRequest;
use App\Services\Certificates\CertificateRevocationService;

class CertificateController extends Controller
{
    public function store(
        IssueCertificateRequest $request,
        CertificateIssuanceService $issuanceService
    ): JsonResponse {
        $data = $request->validated();

        $certificate = $issuanceService->issue(
            userId: (int) $data['user_id'],

            programId: (int) $data['creds_program_id'],

            issuedAt: CarbonImmutable::parse(
                $data['issued_at']
            ),

            expiresAt: isset($data['expires_at'])
            ? CarbonImmutable::parse($data['expires_at'])
            : null,
        );

        $certificate->load([
            'user:id,name,email',
            'program:id,name,type',
        ]);

        return response()->json([
            'message' => 'Certificate issued successfully.',
            'data' => $certificate,
        ], 201);
    }

    public function index(
        ListCertificatesRequest $request
    ): AnonymousResourceCollection {
        $data = $request->validated();

        $search = isset($data['search'])
            ? trim($data['search'])
            : null;

        $certificates = Certificate::query()

            /**
             * with()
             * loads the related user and program in same operation.
             * without this, it wil execute additional queries for every certificate. 
             * N+1 query problem. 1 query for certificates, N queries for users and N queries for programs.
             */

            ->with([
                'user:id,name,email',
                'program:id,name,type',
            ])
            // learning: when():  instead of writing several if stats, laravel adds a query condition only when its filter exists
            ->when(
                $search,
                function ($query) use ($search) {
                    $query->where(function ($query) use ($search) {
                        $query
                            ->where(
                                'recipient_name',
                                'like',
                                "%{$search}%"
                            )
                            ->orWhere(
                                'recipient_email',
                                'like',
                                "%{$search}%"
                            )
                            ->orWhere(
                                'certificate_id',
                                'like',
                                "%{$search}%"
                            );
                    });
                }
            )
            ->when(
                $data['status'] ?? null,
                fn($query, $status) =>
                $query->where('status', $status)
            )
            ->when(
                $data['creds_program_id'] ?? null,
                fn($query, $programId) =>
                $query->where(
                    'creds_program_id',
                    $programId
                )
            )
            ->latest('issued_at')
            ->latest('id')
            ->paginate($data['per_page'] ?? 15)
            ->withQueryString();

        return CertificateResource::collection($certificates);
    }


    /**
     * here we could have loaded using cert_id but i learned there is thing called "route model binding" 
     * in laravel
     * that auto finds and loads the certificate using its internal id
     */
    public function show(
        Certificate $certificate
    ): CertificateResource {
        $certificate->load([
            'user:id,name,email',
            'program:id,name,type',
            'revokedBy:id,name,email',
        ]);

        return new CertificateResource($certificate);
    }

    public function revoke(
        RevokeCertificateRequest $request,
        Certificate $certificate,
        CertificateRevocationService $revocationService
    ): CertificateResource {
        $certificate = $revocationService->revoke(
            certificateId: $certificate->id,

            adminId: (int) $request
                ->user()
                ->getAuthIdentifier(),

            reason: $request->validated('reason'),
        );

        $certificate->load([
            'user:id,name,email',
            'program:id,name,type',
            'revokedBy:id,name,email',
        ]);

        return (new CertificateResource($certificate))
            ->additional([
                'message' =>
                    'Certificate revoked successfully.',
            ]);
    }

}