import {
  AFTER_MUTATION_WINDOW,
  POLLING_INTERVAL,
  POLLING_INTERVAL_AFTER_MUTATION,
} from '@app/queries/constants';
import * as React from 'react';

interface IPollingContext {
  isPollingEnabled: boolean;
  refetchInterval: number | false;
  pollFasterAfterMutation: () => void;
  pausePolling: () => void;
  resumePolling: () => void;
}

const PollingContext = React.createContext<IPollingContext>({
  isPollingEnabled: true,
  refetchInterval: false,
  pollFasterAfterMutation: () => undefined,
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
  const [isJustAfterMutation, setIsJustAfterMutation] = React.useState(false);

  const refetchInterval = !isPollingEnabled
    ? false
    : isJustAfterMutation
    ? POLLING_INTERVAL_AFTER_MUTATION
    : POLLING_INTERVAL;

  const timeoutRef = React.useRef<number | null>(null);

  const pollFasterAfterMutation = () => {
    setIsJustAfterMutation(true);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(
      () => setIsJustAfterMutation(false),
      AFTER_MUTATION_WINDOW
    );
  };

  return (
    <PollingContext.Provider
      value={{
        isPollingEnabled,
        refetchInterval,
        pollFasterAfterMutation,
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
