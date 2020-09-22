import * as React from 'react';

interface IPollingContext {
  isPollingEnabled: boolean;
  pausePolling: () => void;
  resumePolling: () => void;
}

const PollingContext = React.createContext<IPollingContext>({
  isPollingEnabled: true,
  pausePolling: () => undefined,
  resumePolling: () => undefined,
});

interface IPollingContextProviderProps {
  children: React.ReactNode;
}

export const PollingContextProvider: React.FunctionComponent<IPollingContextProviderProps> = ({
  children,
}: IPollingContextProviderProps) => {
  const [isPollingEnabled, setIsPollingEnabled] = React.useState(true);
  return (
    <PollingContext.Provider
      value={{
        isPollingEnabled,
        pausePolling: () => setIsPollingEnabled(false),
        resumePolling: () => setIsPollingEnabled(true),
      }}
    >
      {children}
    </PollingContext.Provider>
  );
};

export const usePollingContext = (): IPollingContext => React.useContext(PollingContext);

export const usePausedPollingEffect = (): void => {
  // Pauses polling when a component mounts, resumes when it unmounts
  const { pausePolling, resumePolling } = usePollingContext();
  React.useEffect(() => {
    pausePolling();
    return resumePolling;
  }, [pausePolling, resumePolling]);
};
