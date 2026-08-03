<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class IssueCertificateRequest extends FormRequest
{

    public function authorize(): bool
    {
        // return false;
        return $this->user()?->is_admin === true;
    }

    public function rules(): array
    {
        return [

            // instead of accepting email on request, we take user_id that will enfroce cert is only assigned to emails with fueler account email. 
            // cert email = fueler account email
            'user_id' => [
                'required',
                'integer',
                'exists:users,id',
            ],
            'creds_program_id' => [
                'required',
                'integer',
                'exists:creds_program,id',
            ],
            'issued_at' => [
                'required',
                'date',
            ],
            'expires_at' => [
                'nullable',
                'date',
                'after_or_equal:issued_at',
            ],
        ];
    }
    public function messages(): array
    {
        return [
            'user_id.exists' =>
                'The selected Fueler user does not exist.',

            'creds_program_id.exists' =>
                'The selected credential program does not exist.',

            'expires_at.after_or_equal' =>
                'The expiration date cannot be before the issue date.',
        ];
    }
}
