import * as React from 'react';
import { useMustGathersQuery } from '@app/queries';
import { UseQueryResult } from 'react-query';
import { IMustGatherResponse, mustGatherStatus } from '@app/client/types';
import { MustGatherWatcher } from '@app/common/components/MustGatherWatcher';
import { NotificationContext } from '@app/common/context';

export type MustGatherObjType = {
  customName: string;
  type: 'plan' | 'vm';
  status: mustGatherStatus;
};

export type mgWatchListType = {
  name: string;
  isGathering: boolean;
}[];

export type mustGatherListType = MustGatherObjType[];
interface IMustGatherContext {
  mustGatherModalOpen: boolean;
  setMustGatherModalOpen: (isOpen: boolean) => void;
  mustGatherList: mustGatherListType;
  setActiveMustGather: (mustGatherObj: MustGatherObjType) => void;
  activeMustGather: MustGatherObjType | undefined;
  mustGatherWatchList: mgWatchListType;
  setMustGatherWatchList: (list: mgWatchListType) => void;
  mustGathersQuery: UseQueryResult<IMustGatherResponse[], Response>;
  latestAssociatedMustGather: (name: string) => IMustGatherResponse | undefined;
}

const mustGatherContextDefaultValue = {} as IMustGatherContext;
export const MustGatherContext = React.createContext<IMustGatherContext>(
  mustGatherContextDefaultValue
);

interface IMustGatherContextProvider {
  children: React.ReactNode;
}

export const MustGatherContextProvider: React.FunctionComponent<IMustGatherContextProvider> = ({
  children,
}: IMustGatherContextProvider) => {
  const appContext = React.useContext(NotificationContext);
  const [mustGatherModalOpen, setMustGatherModalOpen] = React.useState(false);
  const [mustGatherList, setMustGatherList] = React.useState<mustGatherListType>([]);
  const [activeMustGather, setActiveMustGather] = React.useState<MustGatherObjType>();
  const [mustGatherWatchList, setMustGatherWatchList] = React.useState<mgWatchListType>([]);
  const [errorNotified, setErrorNotified] = React.useState(false);

  const mustGathersQuery = useMustGathersQuery(
    'must-gather',
    (data) => {
      const updatedMgList: mustGatherListType = data.map((mg): MustGatherObjType => {
        return {
          customName: mg['custom-name'],
          status: mg.status,
          type: mg.command.toLowerCase().indexOf('plan') ? 'plan' : 'vm',
        };
      });
      setMustGatherList(updatedMgList);
      setErrorNotified(false);
    },
    () => {
      if (!errorNotified) {
        appContext.pushNotification({
          title: 'Could not reach must gather service.',
          message: '',
          key: 'mg-connection-error',
          variant: 'warning',
          actionClose: true,
          timeout: false,
        });
      }

      setErrorNotified(true);
    }
  );

  const latestAssociatedMustGather = (name: string) =>
    mustGathersQuery.data
      ?.sort((x, y) => {
        if (x['created-at'] < y['created-at']) {
          return 1;
        }
        if (x['created-at'] > y['created-at']) {
          return -1;
        }
        return 0;
      })
      .find((mg) => mg['custom-name'] === name);

  React.useEffect(() => {
    const mgToMonitor = mustGatherList.map((mg) => ({
      name: mg.customName,
      // if it was inprogress when the ui started...
      isGathering: mg.status === 'inprogress',
    }));
    // the /must-gather list query doesn't update with latest status when it changes back to "inprogress"
    // after reaching an error state, the list query only seems to update when the mg changes to completed or error
    // so this glue code is here to ensure we can represent the inprogress state when a user retries a must gather
    setMustGatherWatchList(Array.from(new Set(mgToMonitor)));
  }, [mustGatherList]);

  return (
    <MustGatherContext.Provider
      value={{
        mustGathersQuery,
        mustGatherWatchList,
        setMustGatherWatchList,
        mustGatherModalOpen,
        setMustGatherModalOpen,
        mustGatherList,
        activeMustGather,
        setActiveMustGather,
        latestAssociatedMustGather,
      }}
    >
      <>
        {children}
        {mustGatherList.map((mg, idx) => {
          return mg.customName && process.env.NODE_ENV !== 'production' ? (
            <div data-mg-watcher={mg.customName} data-status={mg.status} key={idx}>
              <MustGatherWatcher
                listStatus={mg.status}
                key={`${mg.customName}-${idx}`}
                name={mg.customName}
              />
            </div>
          ) : (
            <MustGatherWatcher
              listStatus={mg.status}
              key={`${mg.customName}-${idx}`}
              name={mg.customName}
            />
          );
        })}
      </>
    </MustGatherContext.Provider>
  );
};
