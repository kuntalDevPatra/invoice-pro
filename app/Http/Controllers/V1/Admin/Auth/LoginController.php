<?php

namespace App\Http\Controllers\V1\Admin\Auth;

use App\Http\Controllers\Controller;
use App\Providers\AppServiceProvider;
use Illuminate\Foundation\Auth\AuthenticatesUsers;

class LoginController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Login Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles authenticating users for the application and
    | redirecting them to your home screen. The controller uses a trait
    | to conveniently provide its functionality to your applications.
    |
    */

    use AuthenticatesUsers;

    /**
     * Where to redirect users after login.
     *
     * @var string
     */
    protected $redirectTo = AppServiceProvider::HOME;

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('guest')->except('logout');
    }

    /**
     * Handle a login request to the application.
     */
    public function login(\Illuminate\Http\Request $request)
    {
        \Illuminate\Support\Facades\Log::info('Login attempt', [
            'email' => $request->input('email'),
            'has_password' => !empty($request->input('password'))
        ]);

        $this->validateLogin($request);

        if (method_exists($this, 'hasTooManyLoginAttempts') &&
            $this->hasTooManyLoginAttempts($request)) {
            $this->fireLockoutEvent($request);
            return $this->sendLockoutResponse($request);
        }

        if ($this->attemptLogin($request)) {
            // Create Sanctum token for API authentication
            $user = \Illuminate\Support\Facades\Auth::user();
            $token = $user->createToken('web-session')->plainTextToken;
            
            \Illuminate\Support\Facades\Log::info('Login successful', [
                'email' => $request->input('email'),
                'user_id' => \Illuminate\Support\Facades\Auth::id(),
                'token_created' => true
            ]);
            
            $response = $this->sendLoginResponse($request);
            return $response->cookie('sanctum_token', $token, 60 * 24 * 7); // 7 days
        }

        \Illuminate\Support\Facades\Log::warning('Login failed', [
            'email' => $request->input('email')
        ]);

        $this->incrementLoginAttempts($request);
        return $this->sendFailedLoginResponse($request);
    }
}
