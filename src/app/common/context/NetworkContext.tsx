import * as React from 'react';
import { LocalStorageKey, useLocalStorageContext } from './LocalStorageContext';
import { AxiosError } from 'axios';
import { History } from 'history';

export interface ICurrentUser {
  access_token?: string;
  expiry_time?: number;
}

export interface INetworkContext {
  saveLoginToken: (user: string, history: History) => void;
  currentUser: ICurrentUser;
  checkExpiry: (error: Response | AxiosError<unknown>, history: History) => void;
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
  const [currentUserStr, setCurrentUserStr] = useLocalStorageContext(LocalStorageKey.currentUser);

  const saveLoginToken = (user: string | null, history: History) => {
    setCurrentUserStr(JSON.stringify(user));
    history.replace('/');
  };

  const checkExpiry = (error: Response | AxiosError<unknown>, history: History) => {
    const status = (error as Response).status || (error as AxiosError<unknown>).response?.status;
    if (status === 401) {
      setCurrentUserStr('');
      history.replace('/');
    }
  };

  const currentUser: ICurrentUser =
    currentUserStr !== null ? JSON.parse(currentUserStr || '{}') : {};

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
