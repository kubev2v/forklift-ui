import { useQueryClient, UseQueryResult, UseMutationResult } from 'react-query';
import { useMockableMutation, getInventoryApiUrl, getClusterApiUrl, useMockableQuery } from './helpers';
import {
  authorizedFetch,
  useAuthorizedK8sClient,
  useFetchContext,
} from './fetchHelpers';
import { IKubeList } from '@app/client/types';
import { usePollingContext } from '@app/common/context';
import { podsResource } from '@app/client/helpers';

export const useClusterPodsQuery = (): UseQueryResult<IKubeList<any>> => {
  const client = useAuthorizedK8sClient();
  return useMockableQuery<any>(
    {
      queryKey: 'pod-logs',
      queryFn: async () => (await client.list<IKubeList<any>>(podsResource)).data,
      refetchInterval: usePollingContext().refetchInterval,
    },
    ''
  );
};

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
          // getInventoryApiUrl('/namespaces/${providerResource.namespace}/pods/forklift-controller-ddf5f5548-92b54/log'),
          // 'healthz',
          // 'api/v1/namespaces/konveyor-forklift/pods/forklift-controller/log',
          // getInventoryApiUrl('providers?detail=1'),
          getClusterApiUrl(
            // 'namespaces/konveyor-forklift/pods/forklift-controller-ddf5f5548-92b54/log'
            'healthz'
            // 'namespaces/konveyor-forklift/pods/forklift-ui/log'
            // 'api/v1/namespaces/konveyor-forklift/pods/forklift-controller/log'
          ),
          fetchContext,
          { 'Content-Type': 'text/plain; charset=utf-8' },
          // {},
          'get',
          'text/plain',
          true,
          options
        )
          .then((logData) => {
            console.log('logData', logData);
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
