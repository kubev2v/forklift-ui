import { queryCache, QueryResult, MutationResultPair } from 'react-query';

import { usePollingContext } from '@app/common/context';
import { POLLING_INTERVAL } from './constants';
import {
  useMockableQuery,
  getInventoryApiUrl,
  sortIndexedResultsByName,
  useMockableMutation,
} from './helpers';
import { MOCK_PROVIDERS } from './mocks/providers.mock';
import { IProvidersByType, Provider, INewProvider, INewSecret } from './types';
import { useAuthorizedFetch, useFetchContext } from './fetchHelpers';
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
import { useHistory } from 'react-router-dom';
import { KubeClientError } from '@app/client/types';

// TODO handle error messages? (query.status will correctly show 'error', but error messages aren't collected)
export const useProvidersQuery = (): QueryResult<IProvidersByType> => {
  const result = useMockableQuery<IProvidersByType>(
    {
      queryKey: 'providers',
      queryFn: useAuthorizedFetch(getInventoryApiUrl('/providers?detail=true')),
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
  INewProvider,
  KubeClientError,
  AddProviderFormValues,
  unknown // TODO replace `unknown` for TSnapshot? not even sure what this is for
> => {
  //move this to its own abstracted post/mutation function
  const { checkExpiry } = useFetchContext();
  const history = useHistory();
  //
  const client = useClientInstance();
  const postProvider = async (values: AddProviderFormValues) => {
    const provider: INewProvider = convertFormValuesToProvider(values, providerType);
    await checkIfResourceExists(
      client,
      VirtResourceKind.Provider,
      providerResource,
      provider.metadata.name
    );
    try {
      const secret: INewSecret = convertFormValuesToSecret(values, VirtResourceKind.Provider);

      const providerAddResults: Array<any> = [];
      const providerSecretAddResult = await client.create(secretResource, secret);

      if (providerSecretAddResult.status === 201) {
        providerAddResults.push(providerSecretAddResult);

        Object.assign(provider.spec.secret, {
          name: providerSecretAddResult.data.metadata.name,
          namespace: providerSecretAddResult.data.metadata.namespace,
        });

        const providerAddResult = await client.create(providerResource, provider);

        if (providerAddResult.status === 201) {
          providerAddResults.push(providerAddResult);
        }
        return providerAddResult;
      }

      // If any of the attempted object creation promises have failed, we need to
      // rollback those that succeeded so we don't have a halfway created "Cluster"
      // A rollback is only required if some objects have actually *succeeded*,
      // as well as failed.
      const isRollbackRequired =
        providerAddResults.find((res) => res.status === 201) &&
        providerAddResults.find((res) => res.status !== 201);

      if (isRollbackRequired) {
        const kindToResourceMap = {
          Provider: providerResource,
          Secret: secretResource,
        };

        // The objects that need to be rolled back are those that were fulfilled
        const rollbackObjs = providerAddResults.reduce((rollbackAccum, res) => {
          return res.status === 201
            ? [...rollbackAccum, { kind: res.data.kind, name: res.data.metadata.name }]
            : rollbackAccum;
        }, []);

        const rollbackResultPromises = await Promise.allSettled(
          rollbackObjs.map((r) => {
            return client.delete(kindToResourceMap[r.kind], r.name);
          })
        );
        Object.keys(rollbackResultPromises).forEach((rollbackResult) => {
          if (rollbackResultPromises[rollbackResult]?.status === 'rejected') {
            throw new Error('Attempted to rollback objects, but failed ');
          } else {
            //   // One of the objects failed, but rollback was successful. Need to alert
            //   // the user that something went wrong, but we were able to recover with
            //   // a rollback
            throw Error(providerAddResults.find((res) => res.state === 'rejected').reason);
          }
        });
      }
    } catch (error) {
      // Something went wrong with rollback, not much we can do at this point
      // except inform the user about what's gone wrong so they can take manual action

      checkExpiry(error, history);
      console.error('Failed to add provider.');
      throw error;
    }
  };

  return useMockableMutation<INewProvider, KubeClientError, AddProviderFormValues>(postProvider, {
    onSuccess: () => {
      queryCache.invalidateQueries('providers');
      onSuccess();
    },
  });
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
