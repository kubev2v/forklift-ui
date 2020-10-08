import {
  MutationResult,
  queryCache,
  QueryResult,
  useMutation,
  MutationResultPair,
  MutationFunction,
} from 'react-query';
import { usePollingContext } from '@app/common/context';
import { POLLING_INTERVAL } from './constants';
import { useMockableQuery, getApiUrl, sortIndexedResultsByName, getClusterApiUrl } from './helpers';
import { MOCK_PROVIDERS } from './mocks/providers.mock';
import { IProvidersByType, Provider, IVMwareProvider, ICommonProvider } from './types';
import { useAuthorizedFetch, useAuthorizedMutate } from './fetchHelpers';
import { any } from 'prop-types';
import { ProviderType, VIRT_META } from '@app/common/constants';

import { ClientFactory } from '@konveyor/lib-ui/dist/modules/kube-client';
// import { ClientFactory } from '../../../client/client_factory';
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
interface IProviderValues {
  type: string;
  name: string;
}
interface IProviderResult {
  test?: any;
}

export const useCreateProvider = () => {
  // const client: IClusterClient = ClientFactory.cluster(state);

  const useProviderPost = async (values: IProviderValues) => {
    try {
      // const response = await fetch(getClusterApiUrl(`/providers/${values.type}`), {
      const user = { access_token: 'fdjklsafjklj', expiry_time: 43898230984902 };
      const client: any = ClientFactory.cluster(user, getClusterApiUrl('/provider/namedfsf'));
      const response = await fetch(getClusterApiUrl(`/provider/namekjkj33`), {
        // mode: 'no-cors',
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${VIRT_META.oauth.clientSecret}`,
          data: JSON.stringify(values),
          // body: JSON.stringify(values),
        },
      });
      if (response.ok && response.json) {
        return response.json();
      } else {
        return Promise.reject(response);
      }
    } catch (error) {
      return Promise.reject(error);
    }
  };

  const [mutate] = useMutation(useProviderPost);

  // return useAuthorizedMutate('url', 'data');
  const createProvider = async (values: IProviderValues) => {
    // Prevent the form from refreshing the page

    try {
      await mutate(values);
      // Todo was successfully created
    } catch (error) {
      // Uh oh, something went wrong
    }
  };
  return {
    createProvider,
  };
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
