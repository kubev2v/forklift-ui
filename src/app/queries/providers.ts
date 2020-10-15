import { queryCache, QueryResult, useMutation, MutationResultPair } from 'react-query';

import { usePollingContext } from '@app/common/context';
import { POLLING_INTERVAL } from './constants';
import {
  useMockableQuery,
  getApiUrl,
  sortIndexedResultsByName,
  useMockableMutation,
} from './helpers';
import { MOCK_PROVIDERS } from './mocks/providers.mock';
import { IProvidersByType, Provider, INewProvider, INewSecret } from './types';
import { useAuthorizedFetch } from './fetchHelpers';
import {
  VirtResourceKind,
  providerResource,
  secretResource,
  convertFormValuesToProvider,
  convertFormValuesToSecret,
  checkIfResourceExists,
  useClientInstance,
} from '@app/client/helpers';
import { AddProviderFormValues } from '@app/Providers/components/AddProviderModal/AddProviderModal';
import { ProviderType } from '@app/common/constants';

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

export const useCreateProviderMutation = (
  providerType: ProviderType | null,
  onSuccess: () => void
): MutationResultPair<
  INewProvider, // TODO: is INewProvider really the TResult type var here? inspect the network response body to see?
  unknown, // TODO: replace `unknown` for TError? we should have a real type here
  AddProviderFormValues,
  unknown // TODO replace `unknown` for TSnapshot? not even sure what this is for
> => {
  const client = useClientInstance();
  const postProvider = async (values: AddProviderFormValues) => {
    const provider: INewProvider = convertFormValuesToProvider(values, providerType);
    try {
      checkIfResourceExists(
        client,
        VirtResourceKind.Provider,
        providerResource,
        provider.metadata.name
      );

      const secret: INewSecret | undefined = convertFormValuesToSecret(
        values,
        VirtResourceKind.Provider
      );
      if (secret) {
        await client.create(secretResource, secret);
      }

      const providerResult = await client.create(providerResource, provider);

      return providerResult;
    } catch (error) {
      console.error('Failed to add provider.');
      return Promise.reject(error);
    }
  };

  return useMockableMutation<INewProvider, unknown, AddProviderFormValues>(
    postProvider,
    {
      onSuccess: (data) => {
        console.log('did we succeed', { data });
        queryCache.invalidateQueries('providers');
        onSuccess();
      },
      onError: (error) => {
        console.log('did we fail', { error });
      },
    },
    'create provider'
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
