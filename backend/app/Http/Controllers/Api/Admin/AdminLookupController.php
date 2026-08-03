<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\CredsProgram;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminLookupController extends Controller
{
    public function users(Request $request): JsonResponse
    {
        $data = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
        ]);

        $search = trim($data['search'] ?? '');

        $users = User::query()
            ->select(['id', 'name', 'email'])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->orderBy('name')
            ->limit(20)
            ->get();

        return response()->json(['data' => $users]);
    }

    public function programs(): JsonResponse
    {
        $programs = CredsProgram::query()
            ->select(['id', 'name', 'type'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $programs]);
    }
}
