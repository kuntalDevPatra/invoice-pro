import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { request } from '@/request';
import * as authActions from '@/redux/auth/actions';
import { API_BASE_URL } from '@/config/serverApiConfig';
import axios from 'axios';
import storePersist from '@/redux/storePersist';

const APP_PATH = import.meta.env.VITE_APP_PATH || '';

const log = (message, data = null) => {
  console.log(`[SSO] ${message}`, data);
  axios.post(`http://localhost:8888${APP_PATH}/api/log`, {
    level: 'info',
    message: `[SSO] ${message}`,
    data
  }).catch(() => {});
};

export default function SSOLogin() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    log('SSO component loaded', { location: location.pathname + location.search });
    
    // Test localStorage persistence first
    localStorage.setItem('test-auth', 'test-value');
    const testValue = localStorage.getItem('test-auth');
    log('localStorage test', { testValue });
    
    const urlParams = new URLSearchParams(location.search);
    const ssoToken = urlParams.get('token');
    const redirectUrl = urlParams.get('redirect_url');
    
    log('SSO token check', { 
      tokenPresent: !!ssoToken, 
      redirectUrl,
      tokenPreview: ssoToken ? ssoToken.substring(0, 50) + '...' : null
    });

    if (!ssoToken) {
      log('No SSO token found, redirecting to login');
      navigate('/login');
      return;
    }

    log('Starting SSO login process', { apiUrl: API_BASE_URL + 'sso-login' });
    
    // Dispatch loading action
    dispatch(authActions.loginRequest());

    // Use axios directly for SSO login
    axios.post(API_BASE_URL + 'sso-login', { token: ssoToken })
      .then((response) => {
        log('SSO API Response received', { success: response.data.success });
        const data = response.data;
        if (data.success) {
          log('SSO login successful, updating state');
          
          // Clear any logout flags first
          localStorage.removeItem('isLogout');
          
          // Update localStorage for persistence
          const auth_state = {
            current: data.result.user,
            isLoggedIn: true,
            isLoading: false,
            isSuccess: true,
          };
          
          log('Setting localStorage auth', { auth_state });
          
          // Try multiple approaches to set localStorage
          try {
            // Clear any existing logout flags
            localStorage.removeItem('isLogout');
            
            // Set auth data with multiple methods
            localStorage.setItem('auth', JSON.stringify(auth_state));
            localStorage.setItem('token', data.result.token);
            storePersist.set('auth', auth_state);
            
            // Update Redux store first
            dispatch(authActions.loginSuccess(data.result.user));
            
            // Verify it was set immediately
            const verification = localStorage.getItem('auth');
            const verification2 = storePersist.get('auth');
            
            log('localStorage verification', {
              directAccess: !!verification,
              storePersistAccess: !!verification2
            });
            
            // Set SSO protection flag to prevent errorHandler from clearing auth
            sessionStorage.setItem('sso_login_in_progress', 'true');
            
            // Add delay to ensure Redux state is updated
            setTimeout(() => {
              log('SSO login complete, redirecting to dashboard');
              window.location.href = '/';
              
              // Clear SSO protection after 5 seconds
              setTimeout(() => {
                sessionStorage.removeItem('sso_login_in_progress');
                log('SSO protection cleared');
              }, 5000);
            }, 500);
            
          } catch (error) {
            log('Error setting localStorage', { error: error.message });
            window.location.href = '/login';
          }
        } else {
          log('SSO login failed', { response: data });
          window.location.href = '/login';
        }
      })
      .catch((error) => {
        log('SSO API call failed', { error: error.message });
        dispatch(authActions.loginFailed());
        navigate('/login');
      });
  }, [location.search, navigate, dispatch]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      backgroundColor: '#f0f0f0'
    }}>
      {/* SSO processing silently in background */}
    </div>
  );
}