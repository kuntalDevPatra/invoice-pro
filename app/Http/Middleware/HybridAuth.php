<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;

class HybridAuth
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Start session for web-based requests (when cookies are present)
        if ($request->hasHeader('Cookie') && !$request->hasSession()) {
            $sessionManager = app('session');
            $session = $sessionManager->driver();
            $session->setId($sessionManager->getId());
            $session->start();
            $request->setLaravelSession($session);
        }
        
        // Check if user is authenticated via web session
        if (Auth::guard('web')->check()) {
            return $next($request);
        }

        // Check if user has sanctum token in cookie
        if ($request->hasCookie('sanctum_token')) {
            $token = $request->cookie('sanctum_token');
            $personalAccessToken = PersonalAccessToken::findToken($token);
            
            if ($personalAccessToken && $personalAccessToken->tokenable) {
                $user = $personalAccessToken->tokenable;
                Auth::guard('web')->setUser($user);
                return $next($request);
            }
        }

        // Check Authorization header for Bearer token
        $bearerToken = $request->bearerToken();
        if ($bearerToken) {
            $personalAccessToken = PersonalAccessToken::findToken($bearerToken);
            
            if ($personalAccessToken && $personalAccessToken->tokenable) {
                $user = $personalAccessToken->tokenable;
                Auth::guard('web')->setUser($user);
                return $next($request);
            }
        }

        return response()->json(['message' => 'Unauthenticated'], 401);
    }
}