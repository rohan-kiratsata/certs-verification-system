<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CredsProgram extends Model
{
    protected $table = 'creds_program';

    protected $fillable = [
        'name',
        'slug',
        'type',
        'description',
        'template',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function certificates(): HasMany
    {
        return $this->hasMany(Certificate::class, 'creds_program_id');
    }
}