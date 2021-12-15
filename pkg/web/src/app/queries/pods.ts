import { UseQueryResult } from 'react-query';
import { getClusterApiUrl, useMockableQuery, mockKubeList } from '@app/queries/helpers';
import { authorizedFetch, useAuthorizedFetch, useFetchContext } from '@app/queries/fetchHelpers';
import { IKubeList } from '@app/client/types';
import { usePollingContext } from '@app/common/context';
import { ContainerType, IPodObject } from '@app/queries/types';
import { getMockLogsByPod } from '@app/queries/mocks/logs.mock';
import { MOCK_PODS } from '@app/queries/mocks/pods.mock';

export const useClusterPodLogsQuery = (
  namespace: string,
  containerType: ContainerType | undefined,
  podName: string | undefined
): UseQueryResult<Blob> => {
  const fetchContext = useFetchContext();
  return useMockableQuery<Blob>(
    {
      enabled: !!podName && !!containerType,
      queryKey: ['pod-logs', podName, namespace],
      queryFn: () =>
        new Promise((res, rej) => {
          authorizedFetch<Blob>(
            getClusterApiUrl(
              `api/v1/namespaces/${namespace}/pods/${podName}/log?container=${containerType}`
            ),
            fetchContext,
            {},
            'get',
            'blob',
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
    getMockLogsByPod(podName, containerType)
  );
};

export const useClusterPodsQuery = (namespace: string): UseQueryResult<IKubeList<IPodObject>> => {
  return useMockableQuery<IKubeList<IPodObject>>(
    {
      queryKey: ['cluster-pods-list', namespace],
      queryFn: useAuthorizedFetch(getClusterApiUrl(`api/v1/namespaces/${namespace}/pods`)),
      refetchInterval: usePollingContext().refetchInterval,
    },
    mockKubeList(MOCK_PODS[namespace], 'PodList')
  );
};
