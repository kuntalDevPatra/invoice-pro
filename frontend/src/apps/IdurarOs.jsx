import { lazy, Suspense, useEffect, useState } from 'react';

import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/auth/selectors';
import { AppContextProvider } from '@/context/appContext';
import PageLoader from '@/components/PageLoader';
import AuthRouter from '@/router/AuthRouter';
import Localization from '@/locale/Localization';
import { notification } from 'antd';
import axios from 'axios';

const APP_PATH = import.meta.env.VITE_APP_PATH || '';

const log = (message, data = null) => {
  console.log(`[FRONTEND] ${message}`, data);
  axios.post(`http://localhost:8888${APP_PATH}/api/log`, {
    level: 'info',
    message,
    data
  }).catch(() => {});
};

// Track localStorage changes
const originalSetItem = localStorage.setItem;
const originalRemoveItem = localStorage.removeItem;
const originalClear = localStorage.clear;

localStorage.setItem = function(key, value) {
  if (key === 'auth' || key === 'isLogout') {
    log(`localStorage.setItem called`, { key, value: key === 'auth' ? 'AUTH_DATA' : value, stack: new Error().stack });
  }
  return originalSetItem.apply(this, arguments);
};

localStorage.removeItem = function(key) {
  if (key === 'auth' || key === 'isLogout') {
    log(`localStorage.removeItem called`, { key, stack: new Error().stack });
  }
  return originalRemoveItem.apply(this, arguments);
};

localStorage.clear = function() {
  log(`localStorage.clear called`, { stack: new Error().stack });
  return originalClear.apply(this, arguments);
};

// Track navigation changes
const originalPushState = history.pushState;
const originalReplaceState = history.replaceState;

history.pushState = function(state, title, url) {
  log(`history.pushState called`, { url, stack: new Error().stack });
  return originalPushState.apply(this, arguments);
};

history.replaceState = function(state, title, url) {
  log(`history.replaceState called`, { url, stack: new Error().stack });
  return originalReplaceState.apply(this, arguments);
};

const ErpApp = lazy(() => import('./ErpApp'));

const DefaultApp = () => (
  <Localization>
    <AppContextProvider>
      <Suspense fallback={<PageLoader />}>
        <ErpApp />
      </Suspense>
    </AppContextProvider>
  </Localization>
);

export default function IdurarOs() {
  const authState = useSelector(selectAuth);
  const { isLoggedIn } = authState;

  // Log component loading
  useEffect(() => {
    log('IdurarOs component loaded', { 
      pathname: window.location.pathname,
      search: window.location.search,
      isLoggedIn 
    });
  }, [isLoggedIn]);

  // Debug auth state
  log('Auth state check', {
    isLoggedIn,
    hasLocalStorageAuth: !!localStorage.getItem('auth'),
    currentPath: window.location.pathname
  });

  console.log(
    '🚀 Welcome to IDURAR ERP CRM! Did you know that we also offer commercial customization services? Contact us at hello@idurarapp.com for more information.'
  );

  // // Online state
  // const [isOnline, setIsOnline] = useState(navigator.onLine);

  // useEffect(() => {
  //   // Update network status
  //   const handleStatusChange = () => {
  //     setIsOnline(navigator.onLine);
  //     if (!isOnline) {
  //       console.log('🚀 ~ useEffect ~ navigator.onLine:', navigator.onLine);
  //       notification.config({
  //         duration: 20,
  //         maxCount: 1,
  //       });
  //       // Code to execute when there is internet connection
  //       notification.error({
  //         message: 'No internet connection',
  //         description: 'Cannot connect to the Internet, Check your internet network',
  //       });
  //     }
  //   };

  //   // Listen to the online status
  //   window.addEventListener('online', handleStatusChange);

  //   // Listen to the offline status
  //   window.addEventListener('offline', handleStatusChange);

  //   // Specify how to clean up after this effect for performance improvment
  //   return () => {
  //     window.removeEventListener('online', handleStatusChange);
  //     window.removeEventListener('offline', handleStatusChange);
  //   };
  // }, [navigator.onLine]);

  // Always show AuthRouter for SSO route to process the token
  if (!isLoggedIn || window.location.pathname === '/sso') {
    log(window.location.pathname === '/sso' ? 'SSO route detected, showing AuthRouter' : 'User not logged in, showing AuthRouter', { 
      path: window.location.pathname,
      authState: authState,
      localStorage: localStorage.getItem('auth')
    });
    return (
      <Localization>
        <AuthRouter />
      </Localization>
    );
  } else {
    log('User logged in, showing DefaultApp', {
      authState: authState,
      localStorage: localStorage.getItem('auth')
    });
    return <DefaultApp />;
  }
}
