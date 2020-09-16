import * as React from 'react';
import '@patternfly/react-core/dist/styles/base.css';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppLayout } from '@app/AppLayout/AppLayout';
import { AppRoutes } from '@app/routes';
import '@app/app.css';
import { LocalStorageContextProvider } from '@app/common/context/LocalStorageContext';
import { Provider } from 'react-redux';
import store from './store';

const App: React.FunctionComponent = () => (
  <Router>
    <LocalStorageContextProvider>
      <Provider store={store}>
        <AppLayout>
          <AppRoutes />
        </AppLayout>
      </Provider>
    </LocalStorageContextProvider>
  </Router>
);

export { App };
