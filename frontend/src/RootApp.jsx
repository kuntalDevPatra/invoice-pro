import './style/app.css';

import { Suspense, lazy } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from '@/redux/store';
import PageLoader from '@/components/PageLoader';

const IdurarOs = lazy(() => import('./apps/IdurarOs'));

const APP_PATH = import.meta.env.VITE_APP_PATH || '';

export default function RoutApp() {
  return (
    <BrowserRouter basename={APP_PATH}>
      <Provider store={store}>
        <Suspense fallback={<PageLoader />}>
          <IdurarOs />
        </Suspense>
      </Provider>
    </BrowserRouter>
  );
}
