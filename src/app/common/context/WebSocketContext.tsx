import * as React from 'react';
import {
  // useVmsSocketMutation,
  // useTestSubscription,
} from '@app/queries';
import { useNetworkContext } from '@app/common/context/NetworkContext';
import { getInventoryApiSocketUrl } from '@app/queries/helpers';
import { QueryClient } from 'react-query';
import { authorizedFetch, useFetchContext } from '@app/queries/fetchHelpers';

interface IWebSocketContext {}

const WebSocketContext = React.createContext<IWebSocketContext>({});

interface IWebSocketContextProviderProps {
  children: React.ReactNode;
  queryClient: QueryClient;
}

export const WebSocketContextProvider: React.FunctionComponent<IWebSocketContextProviderProps> = ({
  children,
  queryClient
}: IWebSocketContextProviderProps) => {

  React.useEffect(() => {

    let websocket: WebSocket | null = null;


    if (queryClient) {

      // const websocket = new WebSocket(`ws://localhost:9001${getInventoryApiSocketUrl('providers/openshift/b245f43c-8448-4643-b697-c2e9d21e40a9/vms')}`);
      // websocket = new WebSocket(`ws://localhost:9001/inventory-api-socket/providers/vsphere/c872d364-d62b-46f0-bd42-16799f40324e/hosts`);
      websocket = new WebSocket(`ws://localhost:9001/inventory-api-socket/health/watch`);
      // websocket = new WebSocket(`/inventory-api-socket/health/watch`);

      websocket.onerror = (error) => {
        console.log('[ws] ERROR CONNECTION', error);
      }

      websocket.onopen = () => {
        console.log('[ws] OPENED CONNECTION');
        websocket?.send('test from client');
      }

      websocket.onclose = () => {
        console.log('[ws] CLOSED CONNECTION');
      }

      websocket.onmessage = (event) => {
        console.log('[ws] ONMESSAGE', event.data);
        // if (event.type === '') {}
        // queryClient.invalidateQueries('');
      }
    }

    return () => {
      console.log('[ws] destroying WS instance');
      websocket?.close()
    }
  }, [queryClient]);

  return (
    <WebSocketContext.Provider value={{}}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = (): IWebSocketContext => React.useContext(WebSocketContext);
