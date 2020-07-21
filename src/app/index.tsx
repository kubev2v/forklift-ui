import * as React from 'react';
import '@patternfly/react-core/dist/styles/base.css';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppLayout } from '@app/AppLayout/AppLayout';
import { AppRoutes } from '@app/routes';
import '@app/app.css';
import { LocalStorageContextProvider } from '@app/common/context/LocalStorageContext';

const App: React.FunctionComponent = () => (
  <Router>
    <LocalStorageContextProvider>
      <AppLayout>
        <AppRoutes />
      </AppLayout>
    </LocalStorageContextProvider>
  </Router>
);

export { App };
