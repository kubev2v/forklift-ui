import * as React from 'react';
import { useMustGathersQuery } from '@app/queries';
import { UseQueryResult } from 'react-query';
import { IMustGatherResponse, mustGatherStatus } from '@app/client/types';
import { MustGatherWatcher } from '@app/common/components/MustGatherWatcher';
import { NotificationContext } from '@app/common/context';
import { useNetworkContext } from '@app/common/context';

export type MustGatherObjType = {
  displayName: string;
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
  mustGathersQuery: UseQueryResult<IMustGatherResponse[], Response>;
  latestAssociatedMustGather: (name: string) => IMustGatherResponse | undefined;
  withNs: (resourceName: string, type: 'plan' | 'vm') => string;
  withoutNs: (namespacedResourceName: string, type: 'plan' | 'vm') => string;
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
  const [errorNotified, setErrorNotified] = React.useState(false);
  const { currentUser } = useNetworkContext();

  const mustGathersQuery = useMustGathersQuery(
    'must-gather',
    !!currentUser.access_token,
    (data) => {
      const updatedMgList: mustGatherListType = data.map((mg): MustGatherObjType => {
        return {
          displayName: mg['custom-name'],
          status: mg.status,
          type: mg.command.toLowerCase().includes('plan') ? 'plan' : 'vm',
        };
      });
      setMustGatherList(updatedMgList);
      setErrorNotified(false);
    },
    (error) => {
      console.log(error);
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

  const withNs = (resourceName: string, type: 'plan' | 'vm') => `${type}:${resourceName}`;
  const withoutNs = (namespacedResourceName: string, type: 'plan' | 'vm') =>
    namespacedResourceName.replace(`${type}:`, '');

  return (
    <MustGatherContext.Provider
      value={{
        mustGathersQuery,
        mustGatherModalOpen,
        setMustGatherModalOpen,
        mustGatherList,
        activeMustGather,
        setActiveMustGather,
        latestAssociatedMustGather,
        withNs,
        withoutNs,
      }}
    >
      <>
        {children}
        {mustGatherList.map((mg, idx) => {
          return (
            <div
              data-mg-watcher={mg.displayName}
              data-type={mg.type}
              data-status={mg.status}
              data-total-num-mg={mustGatherList.length}
              key={idx}
            >
              <MustGatherWatcher
                listStatus={mg.status}
                key={`${mg.displayName}-${idx}`}
                name={mg.displayName}
              />
            </div>
          );
        })}
      </>
    </MustGatherContext.Provider>
  );
};
