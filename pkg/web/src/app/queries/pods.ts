import { useQueryClient, UseQueryResult, UseMutationResult } from 'react-query';
import {
  useMockableMutation,
  getInventoryApiUrl,
  getClusterApiUrl,
  useMockableQuery,
  mockKubeList,
} from '@app/queries/helpers';
import {
  authorizedFetch,
  useAuthorizedFetch,
  useAuthorizedK8sClient,
  useFetchContext,
} from '@app/queries/fetchHelpers';
import { META } from '@app/common/constants';
import { IKubeList } from '@app/client/types';
import { usePollingContext } from '@app/common/context';
import { podsResource } from '@app/client/helpers';
import { ContainerType, IPodObject } from '@app/queries/types';
import { MOCK_LOGS } from '@app/queries/mocks/logs.mock';

export const useClusterPodLogsQuery = (
  containerType: ContainerType
): UseQueryResult<any> => {
  const client = useAuthorizedK8sClient();
  const fetchContext = useFetchContext();
  return useMockableQuery<any>(
    {
      queryKey: 'pod-logs',
      // queryFn: useAuthorizedFetch(getClusterApiUrl(`api/v1/namespaces/${META.namespace}/pods/forklift-controller-7db68559b8-tsgh9/log?container=${containerType}`)),
      queryFn: () =>
        new Promise((res, rej) => {
          authorizedFetch<any>(
            getClusterApiUrl(
              `api/v1/namespaces/${META.namespace}/pods/forklift-controller-7db68559b8-tsgh9/log?container=${containerType}`
              // 'healthz'
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
      // refetchInterval: usePollingContext().refetchInterval,
      refetchInterval: 1250,
    },
    ''
  );
};

export const useClusterPodsQuery = (
  containerType: ContainerType
): UseQueryResult<IKubeList<IPodObject>> => {

  const client = useAuthorizedK8sClient();
  const fetchContext = useFetchContext();

  return useMockableQuery<IKubeList<IPodObject>>(
    {
      queryKey: 'cluster-pods-list',
      // queryFn: async () =>
      //   (
      //     // await client.get<IKubeList<IPodObject>>(
      //     //   podsResource,
      //     //   `forklift-controller-7db68559b8-tsgh9/log?container=${containerType}`
      //     // )
      //     // await client.get<IKubeList<IPodObject>>(podsResource, 'Pod-controller')
      //     // await client.list<IKubeList<IPodObject>>(podsResource)
      //     await `api/v1/namespaces/${META.namespace}/pods`
      //   ).data,

      // queryFn: () =>
      // new Promise((res, rej) => {
      //   authorizedFetch<any>(
      //     getClusterApiUrl(
      //       `api/v1/namespaces/${META.namespace}/pods`
      //       // 'healthz'
      //     ),
      //     fetchContext,
      //     {},
      //     'get',
      //     'json',
      //     true,
      //     {}
      //   )
      //     .then((podsData) => {
      //       res(podsData);
      //     })
      //     .catch((error) => {
      //       rej({
      //         result: 'error',
      //         error: error,
      //       });
      //     });
      // }),

      queryFn: useAuthorizedFetch(getClusterApiUrl(`api/v1/namespaces/${META.namespace}/pods`)),

      refetchInterval: usePollingContext().refetchInterval,
    },
    mockKubeList([], 'Pods')
  );
};

export const usePodLogsQuery = (
  containerType: ContainerType,
  onSuccess?: (data: any) => void,
  onError?: (error: unknown) => void
  // ns: string,
  // podName: string
) => {
  const fetchContext = useFetchContext();

  const logsQuery = useMockableMutation<any>(
    async (options) => {
      return new Promise((res, rej) => {
        authorizedFetch<any>(
          getClusterApiUrl(
            `api/v1/namespaces/${META.namespace}/pods/forklift-controller-7db68559b8-tsgh9/log?container=${containerType}`
            // 'healthz'
          ),
          fetchContext,
          { 'Content-Type': 'text/plain; charset=utf-8' },
          'get',
          'text/plain',
          true,
          options
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
      });
    },
    {
      onSuccess: (data) => {
        onSuccess && onSuccess(data);
      },
      onError: (error) => {
        onError && onError(error);
      },
    }
  );

  return logsQuery;
};
