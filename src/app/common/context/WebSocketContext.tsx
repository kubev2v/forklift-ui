import * as React from 'react';
import {
  // useVmsSocketMutation,
  // useTestSubscription,
} from '@app/queries';
import { useNetworkContext } from '@app/common/context/NetworkContext';
import { getInventoryApiSocketUrl } from '@app/queries/helpers';
import { QueryClient } from 'react-query';

interface IWebSocketContext {
  // isPollingEnabled: boolean;
}

const WebSocketContext = React.createContext<IWebSocketContext>({
  // isPollingEnabled: true,
});

interface IWebSocketContextProviderProps {
  children: React.ReactNode;
  queryClient: QueryClient;
}

export const WebSocketContextProvider: React.FunctionComponent<IWebSocketContextProviderProps> = ({
  children,
  queryClient
}: IWebSocketContextProviderProps) => {
  const { currentUser } = useNetworkContext();
  React.useEffect(() => {


    // const options = 'snapshot';
    // document.cookie = 'X-Watch=' + options + '; path=/';

    // authorizedFetch(
    //   `${getInventoryApiSocketUrl('providers')}`,
    //   fetchContext,
    //   {
    //     // 'X-Watch': ''
    //   }
    //   ).then((result) => {
    //     console.log('result', result);
    //   })

    let websocket: WebSocket | null = null;

    if (currentUser) {
      console.log('setting up WebSocket instance');

      // const websocket = new WebSocket(`${getInventoryApiSocketUrl('providers')}`);
      // const websocket = new WebSocket(`ws://localhost:9001${getInventoryApiSocketUrl('providers/openshift/b245f43c-8448-4643-b697-c2e9d21e40a9/vms')}`);
      websocket = new WebSocket(`ws://localhost:9001/inventory-api-socket/providers/vsphere/c872d364-d62b-46f0-bd42-16799f40324e/hosts`);


      // console.log('websocket', websocket);

      websocket.onerror = (error) => {
        console.log('ERROR CONNECTION', error)
      }

      websocket.onopen = () => {
        console.log('OPENED CONNECTION')
      }

      websocket.onclose = () => {
        console.log('CLOSED CONNECTION');
      }

      websocket.onmessage = (event) => {
        console.log('ONMESSAGE', event.data);
          // event.type == ''
        // queryClient.invalidateQueries('');
      }
    }



    return () => {
      console.log('tearing down WebSocket instance');
      websocket?.close()
    }
  }, [currentUser]);

  return (
    <WebSocketContext.Provider
      value={{
        // isPollingEnabled,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = (): IWebSocketContext => React.useContext(WebSocketContext);
