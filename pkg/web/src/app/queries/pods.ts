import { UseQueryResult } from 'react-query';
import { getClusterApiUrl, useMockableQuery, mockKubeList } from '@app/queries/helpers';
import {
  authorizedFetch,
  useAuthorizedFetch,
  useAuthorizedK8sClient,
  useFetchContext,
} from '@app/queries/fetchHelpers';
import { META } from '@app/common/constants';
import { IKubeList } from '@app/client/types';
import { usePollingContext } from '@app/common/context';
import { ContainerType, IPodObject } from '@app/queries/types';
import { MOCK_LOGS } from '@app/queries/mocks/logs.mock';

export const useClusterPodLogsQuery = (
  containerType: ContainerType | undefined,
  podName: string | undefined
): UseQueryResult<any> => {
  const client = useAuthorizedK8sClient();
  const fetchContext = useFetchContext();
  return useMockableQuery<any>(
    {
      enabled: !!podName && !!containerType,
      queryKey: ['pod-logs', podName],
      queryFn: () =>
        new Promise((res, rej) => {
          authorizedFetch<any>(
            getClusterApiUrl(
              `api/v1/namespaces/${META.namespace}/pods/${podName}/log?container=${containerType}`
            ),
            fetchContext,
            {},
            'get',
            'text/plain',
            true,
            {}
          )
            .then((logData) => {
              res(logData);
            })
            .catch((error) => {
              rej({
                result: 'error',
                error: error,
              });
            });
        }),
      refetchInterval: 1250,
    },
    ''
  );
};

export const useClusterPodsQuery = (): UseQueryResult<IKubeList<IPodObject>> => {
  return useMockableQuery<IKubeList<IPodObject>>(
    {
      queryKey: 'cluster-pods-list',
      queryFn: useAuthorizedFetch(getClusterApiUrl(`api/v1/namespaces/${META.namespace}/pods`)),
      refetchInterval: usePollingContext().refetchInterval,
    },
    mockKubeList([], 'Pods')
  );
};
