<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PublicCertificateResource;
use App\Models\Certificate;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class PublicCertificateController extends Controller
{
    public function show(
        string $certificateId
    ): PublicCertificateResource|JsonResponse {
        $certificateId = Str::upper(
            trim($certificateId)
        );

        $certificate = Certificate::query()
            ->with([
                'program:id,name,type',
            ])
            ->where(
                'certificate_id',
                $certificateId
            )
            ->first();

        if (!$certificate) {
            return response()->json([
                'message' => 'Certificate not found.',
            ], 404);
        }

        return new PublicCertificateResource(
            $certificate
        );
    }
}