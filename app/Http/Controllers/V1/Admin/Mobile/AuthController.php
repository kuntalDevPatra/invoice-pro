<?php

namespace App\Http\Controllers\V1\Admin\Mobile;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        $user = User::where('email', $request->username)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Log the user in using web guard for session-based auth
        Auth::guard('web')->login($user);
        
        // Create Sanctum token for API access
        $token = $user->createToken($request->device_name ?? 'web-app')->plainTextToken;
        
        // Store token in cookie for frontend access (not httponly so JS can read it)
        $cookie = cookie('sanctum_token', $token, 60 * 24 * 7, null, null, false, false); // 7 days, not httponly

        return response()->json([
            'type' => 'Bearer',
            'token' => $token,
        ])->withCookie($cookie);
    }

    public function logout(Request $request)
    {
        // Delete current access token if exists
        if ($request->user() && $request->user()->currentAccessToken()) {
            $request->user()->currentAccessToken()->delete();
        }
        
        // Logout from web guard
        Auth::guard('web')->logout();
        
        // Clear the sanctum token cookie
        $cookie = cookie()->forget('sanctum_token');

        return response()->json([
            'success' => true,
        ])->withCookie($cookie);
    }

    public function check()
    {
        // Check both web guard and sanctum guard
        $webAuth = Auth::guard('web')->check();
        $sanctumAuth = Auth::guard('sanctum')->check();
        $isAuthenticated = $webAuth || $sanctumAuth;
        
        if ($isAuthenticated) {
            $user = Auth::guard('web')->user() ?: Auth::guard('sanctum')->user();
            return response()->json([
                'success' => true,
                'user' => $user
            ]);
        }
        
        return response()->json([
            'success' => false,
            'message' => 'Unauthenticated'
        ], 401);
    }
}
