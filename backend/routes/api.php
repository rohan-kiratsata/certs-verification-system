<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Admin\CertificateController;
use App\Http\Controllers\Api\PublicCertificateController;
use App\Http\Controllers\Api\CertificatePdfController;

// GET /api/health
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'service' => config('app.name'),
        'time' => now()->toIso8601String(),
    ]);
});


// GET /api/user
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get(
    '/certificates/{certificateId}/download',
    [CertificatePdfController::class, 'download']
)->where(
        'certificateId',
        '[A-Za-z0-9-]+'
    );

Route::get(
    '/certificates/{certificateId}',
    [PublicCertificateController::class, 'show']
)->where(
        'certificateId',
        '[A-Za-z0-9-]+'
    );

Route::middleware(['auth:sanctum', 'admin'])
    ->prefix('admin')
    ->group(function () {
        Route::get('/health', function () {
            return response()->json([
                'status' => 'ok',
                'message' => 'Administrator access confirmed.',
            ]);
        });

        // same url will support GET and POST. 
        Route::get(
            '/certificates',
            [CertificateController::class, 'index']
        );
        Route::post(
            '/certificates',
            [CertificateController::class, 'store']
        );
        Route::get(
            '/certificates/{certificate}',
            [CertificateController::class, 'show']
        );

        Route::patch(
            '/certificates/{certificate}/revoke',
            [CertificateController::class, 'revoke']
        );
    });

