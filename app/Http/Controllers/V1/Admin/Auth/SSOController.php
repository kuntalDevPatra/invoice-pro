<?php

namespace App\Http\Controllers\V1\Admin\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class SSOController extends Controller
{
    /**
     * Handle SSO login from SAAS
     */
    public function handleSSOLogin(Request $request)
    {
        try {
            // Get URL parameters without decoding (Laravel already handles this)
            $email = $request->query('email');
            $password = $request->query('password');
            
            Log::info('SSO Login attempt', [
                'email' => $email,
                'password_length' => strlen($password),
                'raw_email' => $request->query('email'),
                'raw_password' => $request->query('password'),
                'all_query_params' => $request->query()
            ]);
            
            if (!$email || !$password) {
                Log::warning('SSO Login failed: Missing credentials');
                return redirect('/login?error=Invalid SSO credentials');
            }

            // Find user by email
            $user = User::where('email', $email)->first();
            
            if (!$user) {
                Log::warning('SSO Login failed: User not found', ['email' => $email]);
                return redirect('/login?error=User not found');
            }

            Log::info('User found, checking password', [
                'user_id' => $user->id,
                'stored_password_length' => strlen($user->password)
            ]);

            // Verify password
            if (!Hash::check($password, $user->password)) {
                Log::warning('SSO Login failed: Invalid password', [
                    'email' => $email,
                    'provided_password' => substr($password, 0, 3) . '***'
                ]);
                return redirect('/login?error=Invalid credentials');
            }

            // Log the user in with remember token
            Auth::login($user, true);
            
            // Create Sanctum token for API authentication
            $token = $user->createToken('web-session')->plainTextToken;
            
            // Save session immediately
            request()->session()->save();
            
            Log::info('SSO Login successful', [
                'email' => $email, 
                'user_id' => $user->id,
                'session_id' => request()->session()->getId(),
                'auth_check' => Auth::check(),
                'token_created' => true
            ]);
            
            // Use auth-bypass view to set up authentication properly
            return view('auth-bypass', [
                'token' => $token,
                'user' => $user->load('companies')
            ]);
        
            
        } catch (\Exception $e) {
            Log::error('SSO Login error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return redirect('/login?error=SSO login failed');
        }
    }
}