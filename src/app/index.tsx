import * as React from 'react';
import '@patternfly/react-core/dist/styles/base.css';
import { QueryClientProvider, QueryClient, QueryCache } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppLayout } from '@app/AppLayout/AppLayout';
import { AppRoutes } from '@app/routes';
import '@app/app.css';
import {
  PollingContextProvider,
  LocalStorageContextProvider,
  NetworkContextProvider,
} from '@app/common/context';
import { noop } from '@app/common/constants';
import { getInventoryApiSocketUrl } from '@app/queries/helpers';

const queryCache = new QueryCache();
const queryClient = new QueryClient({
  queryCache,
  defaultOptions: {
    queries: {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  },
});

const ws = new WebSocket(
  // getInventoryApiSocketUrl('/healt/watch')
  getInventoryApiSocketUrl('providers/ovirt/acd5584c-fe75-453f-b970-b29a8c290254/hosts')
);

ws.onerror = (error) => {
  console.log('[ws] ERROR CONNECTION', error);
};

ws.onopen = () => {
  console.log('[ws] OPENED CONNECTION');
};

ws.onclose = () => {
  console.log('[ws] CLOSED CONNECTION');
};

ws.onmessage = function (event) {
  console.log('[ws] ONMESSAGE', event.data);
};

const App: React.FunctionComponent = () => (
  <QueryClientProvider client={queryClient}>
    <PollingContextProvider>
      <LocalStorageContextProvider>
        <NetworkContextProvider>
          <Router getUserConfirmation={noop}>
            <AppLayout>
              <AppRoutes />
            </AppLayout>
          </Router>
        </NetworkContextProvider>
      </LocalStorageContextProvider>
    </PollingContextProvider>
    {process.env.NODE_ENV !== 'test' ? <ReactQueryDevtools /> : null}
  </QueryClientProvider>
);

export { App };
