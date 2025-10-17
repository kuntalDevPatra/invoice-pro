import { configureStore } from '@reduxjs/toolkit';

import lang from '@/locale/translation/en_us';

import rootReducer from './rootReducer';
import storePersist from './storePersist';

// localStorageHealthCheck();

const AUTH_INITIAL_STATE = {
  current: {},
  isLoggedIn: false,
  isLoading: false,
  isSuccess: false,
};

console.log('🔍 [STORE-DEBUG] Raw localStorage auth:', localStorage.getItem('auth'));
const storedAuth = storePersist.get('auth');
console.log('🔍 [STORE-DEBUG] storePersist.get result:', storedAuth);

const auth_state = storedAuth ? storedAuth : AUTH_INITIAL_STATE;
console.log('🔍 [STORE-DEBUG] Final auth_state for store:', auth_state);

const initialState = { auth: auth_state };

const store = configureStore({
  reducer: rootReducer,
  preloadedState: initialState,
  devTools: import.meta.env.PROD === false, // Enable Redux DevTools in development mode
});

console.log(
  '🚀 Welcome to IDURAR ERP CRM! Did you know that we also offer commercial customization services? Contact us at hello@idurarapp.com for more information.'
);

export default store;
