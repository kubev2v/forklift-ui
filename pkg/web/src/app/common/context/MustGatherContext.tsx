import * as React from 'react';
import { useMustGathersQuery } from '@app/queries';
import { UseQueryResult } from 'react-query';
import { IMustGatherResponse, mustGatherStatus } from '@app/client/types';
import { MustGatherWatcher } from '@app/common/components/MustGatherWatcher';
import { NotificationContext } from '@app/common/context';
import { useNetworkContext } from '@app/common/context';
import { authorizedFetch, useFetchContext } from '@app/queries/fetchHelpers';
import { getMustGatherApiUrl } from '@app/queries/helpers';
import { saveAs } from 'file-saver';

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
  fetchMustGatherResult: (mg: IMustGatherResponse) => Promise<Blob | void>;
  downloadMustGatherResult: (tarBall: Blob, fileName: string) => void;
  notifyDownloadFailed: () => void;
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
  const { pushNotification } = React.useContext(NotificationContext);
  const fetchContext = useFetchContext();
  const [mustGatherModalOpen, setMustGatherModalOpen] = React.useState(false);
  const [mustGatherList, setMustGatherList] = React.useState<mustGatherListType>([]);
  const [activeMustGather, setActiveMustGather] = React.useState<MustGatherObjType>();
  const [errorNotified, setErrorNotified] = React.useState(false);
  const { currentUser } = useNetworkContext();

  const mustGathersQuery = useMustGathersQuery(
    'must-gather',
    !!currentUser.access_token,
    (data) => {
      const updatedMgList: mustGatherListType = data?.map((mg): MustGatherObjType => {
        return {
          displayName: mg['custom-name'],
          status: mg.status,
          type: mg.command.toLowerCase().includes('plan') ? 'plan' : 'vm',
        };
      });
      setMustGatherList(updatedMgList);
      setErrorNotified(false);
    },
    () => {
      if (!errorNotified) {
        pushNotification({
          title: 'Cannot reach must gather service.',
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

  const fetchMustGatherResult = async (mg: IMustGatherResponse) =>
    await authorizedFetch<Blob>(
      getMustGatherApiUrl(`must-gather/${mg?.['id']}/data`),
      fetchContext,
      {},
      'get',
      'blob'
    );

  const downloadMustGatherResult = (tarBall: Blob, fileName: string) => {
    const file = new File([tarBall], fileName, { type: 'text/plain;charset=utf-8' });
    saveAs(file);
  };

  const notifyDownloadFailed = () => {
    pushNotification({
      title: 'Cannot download must gather result',
      message: '',
      key: new Date().toISOString(),
      variant: 'danger',
      timeout: 8000,
    });
  };

  return (
    <MustGatherContext.Provider
      value={{
        notifyDownloadFailed,
        fetchMustGatherResult,
        downloadMustGatherResult,
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
          return mg.displayName && process.env.NODE_ENV !== 'production' ? (
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
          ) : (
            <MustGatherWatcher
              listStatus={mg.status}
              key={`${mg.displayName}-${idx}`}
              name={mg.displayName}
            />
          );
        })}
      </>
    </MustGatherContext.Provider>
  );
};
