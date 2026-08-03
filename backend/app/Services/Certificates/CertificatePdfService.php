<?php

namespace App\Services\Certificates;

use App\Models\Certificate;
use Dompdf\Dompdf;
use Dompdf\Options;
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\ErrorCorrectionLevel;
use Endroid\QrCode\RoundBlockSizeMode;
use Endroid\QrCode\Writer\PngWriter;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class CertificatePdfService
{
    public function generate(
        Certificate $certificate
    ): string {
        $certificate->loadMissing('program');

        $verificationUrl = sprintf(
            '%s/certificates/%s',
            rtrim(
                config('app.frontend_url'),
                '/'
            ),
            $certificate->certificate_id
        );

        $qrCode = Builder::create()
            ->writer(new PngWriter())
            ->data($verificationUrl)
            ->encoding(new Encoding('UTF-8'))
            ->errorCorrectionLevel(
                ErrorCorrectionLevel::Medium
            )
            ->size(240)
            ->margin(10)
            ->roundBlockSizeMode(
                RoundBlockSizeMode::Margin
            )
            ->validateResult(false)
            ->build();

        $html = view(
            'pdf.certificates.default',
            [
                'certificate' => $certificate,
                'verificationUrl' => $verificationUrl,
                'qrDataUri' => $qrCode->getDataUri(),
            ]
        )->render();

        $options = new Options();
        $options->set(
            'defaultFont',
            'DejaVu Sans'
        );

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html);
        $dompdf->setPaper('a4', 'landscape');
        $dompdf->render();

        $path = sprintf(
            'certificates/%s.pdf',
            $certificate->certificate_id
        );

        $saved = Storage::disk('local')->put(
            $path,
            $dompdf->output()
        );

        if (!$saved) {
            throw new RuntimeException(
                'Unable to store the certificate PDF.'
            );
        }

        $certificate->update([
            'pdf_path' => $path,
        ]);

        return $path;
    }

    public function getOrGenerate(
        Certificate $certificate
    ): string {
        if (
            $certificate->pdf_path
            && Storage::disk('local')->exists(
                $certificate->pdf_path
            )
        ) {
            return $certificate->pdf_path;
        }

        return $this->generate($certificate);
    }
}