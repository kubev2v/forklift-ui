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
  WebSocketContextProvider
} from '@app/common/context';
import { noop } from '@app/common/constants';
import {
  // useVmsSocketMutation,
  // useTestSubscription,
} from '@app/queries';
import { getInventoryApiSocketUrl } from '@app/queries/helpers';
import { authorizedFetch, useFetchContext } from '@app/queries/fetchHelpers';

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

const App: React.FunctionComponent = () => {

  return (
    <QueryClientProvider client={queryClient}>
      <WebSocketContextProvider queryClient={queryClient}>
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
      </WebSocketContextProvider>
    </QueryClientProvider>
  )
};

export { App };
