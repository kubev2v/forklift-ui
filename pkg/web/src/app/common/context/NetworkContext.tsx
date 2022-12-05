import * as React from 'react';
import { AxiosError } from 'axios';
import { History } from 'history';
import { useLocalStorage } from '@migtools/lib-ui';

export interface ICurrentUser {
  access_token?: string;
  expiry_time?: number;
}

export interface INetworkContext {
  saveLoginToken: (user: ICurrentUser | null, history: History) => void;
  currentUser: ICurrentUser | null;
  checkExpiry: (error: Response | AxiosError<unknown> | unknown, history: History) => void;
}

const NetworkContext = React.createContext<INetworkContext>({
  saveLoginToken: () => {
    console.error('saveLoginToken was called without a NetworkContextProvider in the tree');
  },
  currentUser: {},
  checkExpiry: () => {
    console.error('checkExpiry was called without a NetworkContextProvider in the tree');
  },
});

interface INetworkContextProviderProps {
  children: React.ReactNode;
}

export const NetworkContextProvider: React.FunctionComponent<INetworkContextProviderProps> = ({
  children,
}: INetworkContextProviderProps) => {
  const [currentUser, setCurrentUser] = useLocalStorage<ICurrentUser | null>('currentUser', null);

  const saveLoginToken = (user: ICurrentUser | null, history: History) => {
    setCurrentUser(user);
    history.replace('/');
  };

  const checkExpiry = (error: Response | AxiosError<unknown> | unknown, history: History) => {
    const status = (error as Response).status || (error as AxiosError<unknown>).response?.status;
    if (status === 401) {
      setCurrentUser(null);
      history.replace('/');
    }
  };

  return (
    <NetworkContext.Provider
      value={{
        saveLoginToken,
        currentUser,
        checkExpiry,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetworkContext = (): INetworkContext => React.useContext(NetworkContext);
