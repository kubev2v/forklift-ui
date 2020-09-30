import * as React from 'react';

interface IOAuthContext {
  setFailedUrl: (url: string) => void;
  failedUrl: string;
}

const OAuthContext = React.createContext<IOAuthContext>({
  failedUrl: '',
  setFailedUrl: () => {
    console.error('setFailedUrl was called without a OAuthContextProvider in the tree');
  },
});

interface IOAuthContextProviderProps {
  children: React.ReactNode;
}

export const OAuthContextProvider: React.FunctionComponent<IOAuthContextProviderProps> = ({
  children,
}: IOAuthContextProviderProps) => {
  const [failedUrl, setFailedUrl] = React.useState('');
  return (
    <OAuthContext.Provider
      value={{
        failedUrl,
        setFailedUrl,
      }}
    >
      {children}
    </OAuthContext.Provider>
  );
};

export const useOAuthContext = (): IOAuthContext => React.useContext(OAuthContext);
