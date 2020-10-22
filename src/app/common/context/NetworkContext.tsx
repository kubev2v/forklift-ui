import * as React from 'react';
import { LocalStorageKey, useLocalStorageContext } from './LocalStorageContext';
import { setTokenExpiryHandler } from '@konveyor/lib-ui/dist';

export interface INetworkContext {
  setSelfSignedCertUrl: (url: string) => void;
  selfSignedCertUrl: string;
  saveLoginToken: (user: string, history: any) => void;
  currentUser: string;
  checkExpiry: (user: string, history: any) => void;
}

const NetworkContext = React.createContext<INetworkContext>({
  selfSignedCertUrl: '',
  setSelfSignedCertUrl: () => {
    console.error('setSelfSignedCertUrl was called without a NetworkContextProvider in the tree');
  },
  saveLoginToken: () => {
    console.error('saveLoginToken was called without a NetworkContextProvider in the tree');
  },
  currentUser: '',
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
  const [selfSignedCertUrl, setSelfSignedCertUrl] = React.useState('');
  const [currentUser, setCurrentUser] = useLocalStorageContext(LocalStorageKey.currentUser);

  const saveLoginToken = (user, history) => {
    setCurrentUser(JSON.stringify(user));
    history.push('/');
  };

  const checkExpiry = (error, history) => {
    if (error.response && error.response.status === 401) {
      setCurrentUser('');
      history.push('/');
    }
  };

  return (
    <NetworkContext.Provider
      value={{
        selfSignedCertUrl,
        setSelfSignedCertUrl,
        saveLoginToken,
        currentUser: currentUser || '',
        checkExpiry,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetworkContext = (): INetworkContext => React.useContext(NetworkContext);
