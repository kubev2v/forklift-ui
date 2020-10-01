import * as React from 'react';
import { LocalStorageKey, useLocalStorageContext } from './LocalStorageContext';

interface IAppContext {
  setSelfSignedCertUrl: (url: string) => void;
  selfSignedCertUrl: string;
  saveLoginToken: (user: string, history: any) => void;
}

const AppContext = React.createContext<IAppContext>({
  selfSignedCertUrl: '',
  setSelfSignedCertUrl: () => {
    console.error('setSelfSignedCertUrl was called without a AppContextProvider in the tree');
  },
  saveLoginToken: () => {
    console.error('saveLoginToken was called without a AppContextProvider in the tree');
  },
});

interface IAppContextProviderProps {
  children: React.ReactNode;
}

export const AppContextProvider: React.FunctionComponent<IAppContextProviderProps> = ({
  children,
}: IAppContextProviderProps) => {
  const [selfSignedCertUrl, setSelfSignedCertUrl] = React.useState('');
  const [currentUser, setCurrentUser] = useLocalStorageContext(LocalStorageKey.currentUser);

  const saveLoginToken = (user, history) => {
    setCurrentUser(user);
    console.log('history', history);
    history.push('/');
  };

  return (
    <AppContext.Provider
      value={{
        selfSignedCertUrl,
        setSelfSignedCertUrl,
        saveLoginToken,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): IAppContext => React.useContext(AppContext);
