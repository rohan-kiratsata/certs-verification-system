<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    /**
     * req have logged in user?
     *  -> is that a admin?
     * if yes:
     *      continue
     * if no:
     *      return 403
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user()?->is_admin) {
            abort(403, 'Admin access required bro!');
        }
        return $next($request);
    }
}
