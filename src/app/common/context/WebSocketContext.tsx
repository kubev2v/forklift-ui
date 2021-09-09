import * as React from 'react';
import { useNetworkContext } from './NetworkContext';

export interface IWebSocketContext {
  foo: string;
}

const WebSocketContext = React.createContext<IWebSocketContext>({
  foo: '',
});

interface IWebSocketContextProviderProps {
  children: React.ReactNode;
}

export const WebSocketContextProvider: React.FunctionComponent<IWebSocketContextProviderProps> = ({
  children,
}: IWebSocketContextProviderProps) => {
  const { currentUser } = useNetworkContext();

  React.useEffect(() => {
    if (currentUser) {
      console.log('ATTEMPTING TO OPEN SOCKET CONNECTION...');
      const socket = new WebSocket(
        'ws://localhost:9001/inventory-api/providers/vsphere/c872d364-d62b-46f0-bd42-16799f40324e/hosts'
      );

      socket.addEventListener('open', function (event) {
        console.log('CONNECTED TO INVENTORY WEBSOCKET');
        // socket.send('Hello Server!');
      });

      socket.addEventListener('error', function (error) {
        console.log('SOCKET ERROR: ', error);
      });

      socket.addEventListener('message', function (event) {
        console.log('Message from server ', event.data);
      });
    }
  }, [currentUser]);

  return (
    <WebSocketContext.Provider
      value={{
        foo: '',
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = (): IWebSocketContext => React.useContext(WebSocketContext);
