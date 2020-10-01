import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { LocalStorageKey, useLocalStorageContext } from './LocalStorageContext';

interface IOAuthContext {
  setFailedUrl: (url: string) => void;
  failedUrl: string;
  migMeta: any;
  saveLoginToken: (user: string) => void;
}

const OAuthContext = React.createContext<IOAuthContext>({
  failedUrl: '',
  setFailedUrl: () => {
    console.error('setFailedUrl was called without a OAuthContextProvider in the tree');
  },
  migMeta: null,
  saveLoginToken: () => {
    console.error('saveLoginToken was called without a OAuthContextProvider in the tree');
  },
});

interface IOAuthContextProviderProps {
  children: React.ReactNode;
}

export const OAuthContextProvider: React.FunctionComponent<IOAuthContextProviderProps> = ({
  children,
}: IOAuthContextProviderProps) => {
  const [failedUrl, setFailedUrl] = React.useState('');
  const [migMeta, setMigMeta] = React.useState('');
  const [currentUser, setCurrentUser] = useLocalStorageContext(LocalStorageKey.currentUser);
  const history = useHistory();

  const saveLoginToken = (user) => {
    setCurrentUser(user);
    history.push('/');
  };

  const migMetaObject = window['_mig_meta'];
  React.useEffect(() => {
    if (migMetaObject) {
      setMigMeta(migMetaObject);

      if (currentUser) {
        //TODO: any side effects when a user logs in add here
      }
    }
  }, [currentUser, migMetaObject]);

  return (
    <OAuthContext.Provider
      value={{
        failedUrl,
        setFailedUrl,
        saveLoginToken,
        migMeta,
      }}
    >
      {children}
    </OAuthContext.Provider>
  );
};

export const useOAuthContext = (): IOAuthContext => React.useContext(OAuthContext);
