<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles)
    {
        $user = $request->user();

        if (! $user || (count($roles) && ! $user->hasAnyRole($roles))) {
            return new JsonResponse([
                'message' => 'You are not authorized to access this resource.',
            ], 403);
        }

        return $next($request);
    }
}
