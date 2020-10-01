import * as React from 'react';
import { LocalStorageKey, useLocalStorageContext } from './LocalStorageContext';

interface INetworkContext {
  setSelfSignedCertUrl: (url: string) => void;
  selfSignedCertUrl: string;
  saveLoginToken: (user: string, history: any) => void;
}

const NetworkContext = React.createContext<INetworkContext>({
  selfSignedCertUrl: '',
  setSelfSignedCertUrl: () => {
    console.error('setSelfSignedCertUrl was called without a NetworkContextProvider in the tree');
  },
  saveLoginToken: () => {
    console.error('saveLoginToken was called without a NetworkContextProvider in the tree');
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
    setCurrentUser(user);
    console.log('history', history);
    history.push('/');
  };

  return (
    <NetworkContext.Provider
      value={{
        selfSignedCertUrl,
        setSelfSignedCertUrl,
        saveLoginToken,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetworkContext = (): INetworkContext => React.useContext(NetworkContext);
