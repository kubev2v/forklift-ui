import { useQueryClient, UseQueryResult, UseMutationResult } from 'react-query';
import { useMockableMutation, getInventoryApiUrl, getClusterApiUrl, useMockableQuery, mockKubeList } from './helpers';
import {
  authorizedFetch,
  useAuthorizedFetch,
  useAuthorizedK8sClient,
  useFetchContext,
} from './fetchHelpers';
import { IKubeList } from '@app/client/types';
import { usePollingContext } from '@app/common/context';
import { podsResource } from '@app/client/helpers';
import { ILogObject } from '@app/queries/types';
import { MOCK_LOGS } from './mocks/logs.mock';

export const useClusterPodLogsQuery = (): UseQueryResult<any> => {
  const client = useAuthorizedK8sClient();
  const fetchContext = useFetchContext();
  return useMockableQuery<any>(
    {
      queryKey: 'pod-logs',
      // queryFn: useAuthorizedFetch(getClusterApiUrl('api/v1/namespaces/openshift-mtv/pods/forklift-controller-64dddf5b45-9dpnm/log?container=main')),
      queryFn: () => new Promise((res, rej) => {
        authorizedFetch<any>(
          getClusterApiUrl(
            'api/v1/namespaces/openshift-mtv/pods/forklift-controller-64dddf5b45-9dpnm/log?container=main'
            // 'healthz'
          ),
          fetchContext,
          {},
          'get',
          'text/plain',
          true,
          {}
        ).then((logData) => {
          res(logData);
        })
        .catch((error) => {
          rej({
            result: 'error',
            error: error,
          });
        });
      }),
      refetchInterval: usePollingContext().refetchInterval,
    },
    ''
  );
};

// export const useClusterPodsQuery = (): UseQueryResult<IKubeList<ILogObject>> => {
//   const client = useAuthorizedK8sClient();
//   return useMockableQuery<IKubeList<ILogObject>>(
//     {
//       queryKey: 'cluster-pods',
//       queryFn: async () => (await client.list<IKubeList<ILogObject>>(podsResource)).data,
//       refetchInterval: usePollingContext().refetchInterval,
//     },
//     mockKubeList([], 'Pods')
//   );
// };

export const usePodLogsQuery = (
  url?: string,
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
            'api/v1/namespaces/openshift-mtv/pods/forklift-controller-64dddf5b45-9dpnm/log?container=main'
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
