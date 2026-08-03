<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">

    <title>
        Certificate {{ $certificate->certificate_id }}
    </title>

    <style>
        @page {
            size: A4 landscape;
            margin: 0;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            padding: 0;
            font-family: "DejaVu Sans", sans-serif;
            color: #161616;
            background: #f5f1e8;
        }

        .certificate {
            position: relative;
            width: 100%;
            height: 100%;
            min-height: 790px;
            padding: 54px;
            border: 14px solid #161616;
            background: #fffdf8;
        }

        .inner-border {
            min-height: 654px;
            padding: 46px 60px;
            border: 2px solid #cabd9d;
            text-align: center;
        }

        .brand {
            margin-bottom: 42px;
            font-size: 30px;
            font-weight: bold;
            letter-spacing: -2px;
            text-transform: lowercase;
        }

        .eyebrow {
            margin-bottom: 16px;
            color: #746a58;
            font-size: 13px;
            letter-spacing: 3px;
            text-transform: uppercase;
        }

        h1 {
            margin: 0 0 28px;
            font-family: "DejaVu Serif", serif;
            font-size: 48px;
            font-weight: normal;
        }

        .intro {
            margin-bottom: 18px;
            color: #615b50;
            font-size: 16px;
        }

        .recipient {
            margin: 0 auto 20px;
            padding-bottom: 10px;
            width: 70%;
            border-bottom: 1px solid #cabd9d;
            font-family: "DejaVu Serif", serif;
            font-size: 38px;
            font-weight: bold;
        }

        .program-text {
            margin: 0 auto 42px;
            max-width: 720px;
            color: #403b33;
            font-size: 17px;
            line-height: 1.7;
        }

        .program-name {
            font-weight: bold;
        }

        .footer-table {
            width: 100%;
            margin-top: 30px;
            border-collapse: collapse;
        }

        .footer-table td {
            width: 33.33%;
            vertical-align: bottom;
            text-align: center;
        }

        .value {
            margin-bottom: 7px;
            font-size: 14px;
            font-weight: bold;
        }

        .label {
            color: #746a58;
            font-size: 10px;
            letter-spacing: 1.5px;
            text-transform: uppercase;
        }

        .signature {
            margin: 0 auto 8px;
            width: 180px;
            padding-bottom: 7px;
            border-bottom: 1px solid #161616;
            font-family: "DejaVu Serif", serif;
            font-size: 23px;
            font-style: italic;
        }

        .qr-code {
            width: 92px;
            height: 92px;
        }

        .verify-text {
            margin-top: 4px;
            color: #746a58;
            font-size: 8px;
        }
    </style>
</head>

<body>
    <main class="certificate">
        <section class="inner-border">
            <div class="brand">fueler</div>

            <div class="eyebrow">
                Certificate of Completion
            </div>

            <h1>Certificate of Achievement</h1>

            <div class="intro">
                This certificate is proudly presented to
            </div>

            <div class="recipient">
                {{ $certificate->recipient_name }}
            </div>

            <div class="program-text">
                for successfully completing the
                <span class="program-name">
                    {{ $certificate->program->name }}
                </span>
                and demonstrating commitment, consistency,
                and excellence throughout the program.
            </div>

            <table class="footer-table">
                <tr>
                    <td>
                        <div class="value">
                            {{ $certificate->issued_at->format('F j, Y') }}
                        </div>

                        <div class="label">Issue date</div>
                    </td>

                    <td>
                        <div class="signature">
                            Fueler
                        </div>

                        <div class="label">
                            Authorized signature
                        </div>
                    </td>

                    <td>
                        <img class="qr-code" src="{{ $qrDataUri }}" alt="Verification QR code">

                        <div class="value">
                            {{ $certificate->certificate_id }}
                        </div>

                        <div class="label">
                            Credential ID
                        </div>

                        <div class="verify-text">
                            Scan to verify
                        </div>
                    </td>
                </tr>
            </table>
        </section>
    </main>
</body>

</html>