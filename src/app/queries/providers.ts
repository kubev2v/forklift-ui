import { MutationResult, queryCache, QueryResult, useMutation } from 'react-query';
import { usePollingContext } from '@app/common/context';
import { POLLING_INTERVAL } from './constants';
import {
  useMockableQuery,
  getApiUrl,
  sortIndexedResultsByName,
  useMockableMutation,
} from './helpers';
import { MOCK_PROVIDERS } from './mocks/providers.mock';
import { IProvidersByType, Provider } from './types';
import { useAuthorizedFetch } from './fetchHelpers';
import { any } from 'prop-types';

// TODO handle error messages? (query.status will correctly show 'error', but error messages aren't collected)
export const useProvidersQuery = (): QueryResult<IProvidersByType> => {
  const result = useMockableQuery<IProvidersByType>(
    {
      queryKey: 'providers',
      queryFn: useAuthorizedFetch(getApiUrl('/providers?detail=true')),
      config: { refetchInterval: usePollingContext().isPollingEnabled ? POLLING_INTERVAL : false },
    },
    MOCK_PROVIDERS
  );

  return sortIndexedResultsByName<Provider, IProvidersByType>(result);
};
interface IProviderRequest {
  type: string;
  name: string;
}
// interface IProviderResult extends MutationResult {
//   test: any;
// }

export const useCreateProvider = (providerRequestObj: IProviderRequest): void => {
  useMockableMutation<any, any, IProviderRequest, any>(
    useAuthorizedFetch(
      getApiUrl(`/providers/${providerRequestObj.type}/${providerRequestObj.name}`)
    ),
    {
      onSuccess: () => queryCache.refetchQueries('providers'),
    }
  );
};

export const useHasSufficientProvidersQuery = (): {
  isLoading: boolean;
  isError: boolean;
  hasSufficientProviders: boolean | undefined;
} => {
  const result = useProvidersQuery();
  const vmwareProviders = result.data?.vsphere || [];
  const openshiftProviders = result.data?.openshift || [];
  const hasSufficientProviders = result.data
    ? vmwareProviders.length >= 1 && openshiftProviders.length >= 1
    : undefined;
  return {
    isLoading: result.isLoading,
    isError: result.isError,
    hasSufficientProviders,
  };
};
