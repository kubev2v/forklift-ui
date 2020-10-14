import {
  MutationResult,
  queryCache,
  QueryResult,
  useMutation,
  MutationResultPair,
  MutationFunction,
} from 'react-query';
import { ClientFactory } from '@konveyor/lib-ui/dist/';

import { usePollingContext, useNetworkContext } from '@app/common/context';
import { POLLING_INTERVAL } from './constants';
import { useMockableQuery, getApiUrl, sortIndexedResultsByName } from './helpers';
import { MOCK_PROVIDERS } from './mocks/providers.mock';
import {
  IProvidersByType,
  Provider,
  IVMwareProvider,
  ICommonProvider,
  IOpenShiftProvider,
  INewProvider,
  INewSecret,
} from './types';
import { useAuthorizedFetch, useAuthorizedMutate } from './fetchHelpers';
import { ProviderType, VIRT_META } from '@app/common/constants';
import {
  VirtResource,
  VirtResourceKind,
  providerResource,
  secretResource,
  convertFormValuesToProvider,
  convertFormValuesToSecret,
  getTokenSecretLabelSelector,
  checkIfResourceExists,
  useClientInstance,
  useCheckIfResourceExists,
} from '@app/client/helpers';
import { OpenshiftFormState } from '@app/Providers/components/AddProviderModal/useOpenshiftFormState';
import { VMwareFormState } from '@app/Providers/components/AddProviderModal/useVMwareFormState';

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
export const useCreateProvider = () => {
  const client = useClientInstance();
  const useProviderPost = async (
    values: OpenshiftFormState['values'] | VMwareFormState['values']
  ) => {
    const provider: INewProvider = convertFormValuesToProvider(values);
    useCheckIfResourceExists(
      client,
      VirtResourceKind.Provider,
      providerResource,
      provider.metadata.name
    );

    try {
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

  const [mutate, { isIdle, isLoading, isError, isSuccess, data, error }] = useMutation(
    useProviderPost,
    {
      onSuccess: () => {
        console.log('did we succeed');
        queryCache.invalidateQueries('providers');
      },
      onError: () => {
        console.log('did we fail');
      },
    }
  );

  const createProvider = async (formValues) => {
    try {
      await mutate(formValues);
    } catch (error) {
      // Uh oh, something went wrong
    }
  };
  return {
    createProvider,
    isIdle,
    isLoading,
    isError,
    isSuccess,
    error,
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
