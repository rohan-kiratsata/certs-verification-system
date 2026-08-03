<?php

namespace App\Enums;

enum CertificateStatus: string
{
    case ACTIVE = 'active';
    case REVOKED = 'revoked';
}