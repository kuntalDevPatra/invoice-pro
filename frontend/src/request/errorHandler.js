import { notification } from 'antd';
import codeMessage from './codeMessage';

const errorHandler = (error) => {
  if (!navigator.onLine) {
    notification.config({
      duration: 15,
      maxCount: 1,
    });
    // Code to execute when there is internet connection
    notification.error({
      message: 'No internet connection',
      description: 'Cannot connect to the Internet, Check your internet network',
    });
    return {
      success: false,
      result: null,
      message: 'Cannot connect to the server, Check your internet network',
    };
  }

  const { response } = error;

  if (!response) {
    notification.config({
      duration: 20,
      maxCount: 1,
    });
    // Code to execute when there is no internet connection
    // notification.error({
    //   message: 'Problem connecting to server',
    //   description: 'Cannot connect to the server, Try again later',
    // });
    return {
      success: false,
      result: null,
      message: 'Cannot connect to the server, Contact your Account administrator',
    };
  }

  if (response && response.data && response.data.jwtExpired) {
    // Don't clear auth during SSO process or shortly after
    const ssoProtection = sessionStorage.getItem('sso_login_in_progress');
    const recentLogin = sessionStorage.getItem('recent_login');
    console.log('JWT Expired - Protection check:', { ssoProtection, recentLogin, path: window.location.pathname });
    // Temporarily disable auth clearing to prevent logout loop
    return {
      success: false,
      result: null,
      message: 'JWT expired ignored to prevent logout loop',
    };
    
    // const result = window.localStorage.getItem('auth');
    // const jsonFile = window.localStorage.getItem('isLogout');
    // const { isLogout } = (jsonFile && JSON.parse(jsonFile)) || false;
    // window.localStorage.removeItem('auth');
    // window.localStorage.removeItem('isLogout');
    // if (result || isLogout) {
    //   const APP_PATH = import.meta.env?.VITE_APP_PATH || '';
    //   window.location.href = `${APP_PATH}/logout`;
    // }
  }

  if (response && response.status) {
    const message = response.data && response.data.message;

    const errorText = message || codeMessage[response.status];
    const { status, error } = response;
    notification.config({
      duration: 20,
      maxCount: 2,
    });
    notification.error({
      message: `Request error ${status}`,
      description: errorText,
    });

    if (response?.data?.error?.name === 'JsonWebTokenError') {
      // Don't clear auth during SSO process, initial load, or shortly after login
      const ssoProtection = sessionStorage.getItem('sso_login_in_progress');
      const recentLogin = sessionStorage.getItem('recent_login');
      console.log('JWT Error - Protection check:', { ssoProtection, recentLogin, path: window.location.pathname });
      // Temporarily disable auth clearing to prevent logout loop
      return {
        success: false,
        result: null,
        message: 'JWT error ignored to prevent logout loop',
      };
      
      // window.localStorage.removeItem('auth');
      // window.localStorage.removeItem('isLogout');
      // const APP_PATH = import.meta.env?.VITE_APP_PATH || '';
      // window.location.href = `${APP_PATH}/logout`;
    } else return response.data;
  } else {
    notification.config({
      duration: 15,
      maxCount: 1,
    });

    if (navigator.onLine) {
      // Code to execute when there is internet connection
      notification.error({
        message: 'Problem connecting to server',
        description: 'Cannot connect to the server, Try again later',
      });
      return {
        success: false,
        result: null,
        message: 'Cannot connect to the server, Contact your Account administrator',
      };
    } else {
      // Code to execute when there is no internet connection
      notification.error({
        message: 'No internet connection',
        description: 'Cannot connect to the Internet, Check your internet network',
      });
      return {
        success: false,
        result: null,
        message: 'Cannot connect to the server, Check your internet network',
      };
    }
  }
};

export default errorHandler;
