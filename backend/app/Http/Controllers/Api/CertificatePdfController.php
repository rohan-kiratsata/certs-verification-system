<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Services\Certificates\CertificatePdfService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CertificatePdfController extends Controller
{
    public function download(
        string $certificateId,
        CertificatePdfService $pdfService
    ): StreamedResponse|JsonResponse {
        $certificateId = Str::upper(
            trim($certificateId)
        );

        $certificate = Certificate::query()
            ->with('program')
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

        if ($certificate->isRevoked()) {
            return response()->json([
                'message' =>
                    'A revoked certificate cannot be downloaded.',
            ], 409);
        }

        if (
            $certificate->expires_at !== null
            && $certificate->expires_at->lt(today())
        ) {
            return response()->json([
                'message' =>
                    'An expired certificate cannot be downloaded.',
            ], 409);
        }

        $path = $pdfService->getOrGenerate(
            $certificate
        );

        return Storage::disk('local')->download(
            $path,
            sprintf(
                'fueler-certificate-%s.pdf',
                $certificate->certificate_id
            ),
            [
                'Content-Type' => 'application/pdf',
            ]
        );
    }
}