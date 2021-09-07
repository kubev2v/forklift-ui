import * as React from 'react';
import {
  // useVmsSocketMutation,
  // useTestSubscription,
} from '@app/queries';
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

    console.log('setting up WebSocket instance');

    // const websocket = new WebSocket(`${getInventoryApiSocketUrl('providers')}`);
    const websocket = new WebSocket(`ws://localhost:9000${getInventoryApiSocketUrl('providers')}`);

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

    return () => {
      console.log('tearing down WebSocket instance');
      websocket.close()
    }
  }, [queryClient]);

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
