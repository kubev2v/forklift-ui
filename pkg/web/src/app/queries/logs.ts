import { useMockableMutation, getInventoryApiUrl } from './helpers';
import {
  authorizedFetch,
  useFetchContext,
} from './fetchHelpers';

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
          // '/namespaces/konveyor-forklift/pods/forklift-controller/log',
          // getInventoryApiUrl('providers?detail=1'),
          getInventoryApiUrl(
            'namespaces/konveyor-forklift/pods/forklift-controller-ddf5f5548-92b54/log'
          ),
          fetchContext,
          { 'Content-Type': 'application/json' },
          'get',
          'json',
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
