import { useQueryCache, QueryResult, MutationResultPair } from 'react-query';
import * as yup from 'yup';
import Q from 'q';

import { usePollingContext } from '@app/common/context';
import {
  useMockableQuery,
  getInventoryApiUrl,
  sortIndexedResultsByName,
  useMockableMutation,
  isSameResource,
} from './helpers';
import { MOCK_PROVIDERS } from './mocks/providers.mock';
import {
  IProvidersByType,
  Provider,
  INewSecret,
  IVMwareProvider,
  IOpenShiftProvider,
  ISrcDestRefs,
  ICommonProviderObject,
} from './types';
import { useAuthorizedFetch, useAuthorizedK8sClient } from './fetchHelpers';
import {
  VirtResourceKind,
  providerResource,
  secretResource,
  convertFormValuesToProvider,
  convertFormValuesToSecret,
  checkIfResourceExists,
} from '@app/client/helpers';
import { AddProviderFormValues } from '@app/Providers/components/AddEditProviderModal/AddEditProviderModal';
import { dnsLabelNameSchema, ProviderType } from '@app/common/constants';
import { IKubeResponse, IKubeStatus, KubeClientError } from '@app/client/types';

// TODO handle error messages? (query.status will correctly show 'error', but error messages aren't collected)
export const useProvidersQuery = (): QueryResult<IProvidersByType> => {
  const result = useMockableQuery<IProvidersByType>(
    {
      queryKey: 'providers',
      queryFn: useAuthorizedFetch(getInventoryApiUrl('/providers?detail=true')),
      config: { refetchInterval: usePollingContext().refetchInterval },
    },
    MOCK_PROVIDERS
  );

  return sortIndexedResultsByName<Provider, IProvidersByType>(result);
};

export const useCreateProviderMutation = (
  providerType: ProviderType | null,
  onSuccess: () => void
): MutationResultPair<
  IKubeResponse<ICommonProviderObject> | undefined,
  KubeClientError,
  AddProviderFormValues,
  unknown // TODO replace `unknown` for TSnapshot? not even sure what this is for
> => {
  const client = useAuthorizedK8sClient();
  const queryCache = useQueryCache();
  const { pollFasterAfterMutation } = usePollingContext();
  const postProvider = async (values: AddProviderFormValues) => {
    const provider: ICommonProviderObject = convertFormValuesToProvider(values, providerType);
    await checkIfResourceExists(
      client,
      VirtResourceKind.Provider,
      providerResource,
      provider.metadata.name
    );
    try {
      const secret: INewSecret = convertFormValuesToSecret(values, VirtResourceKind.Provider);

      const providerAddResults: Array<IKubeResponse<INewSecret | ICommonProviderObject>> = [];
      const providerSecretAddResult = await client.create<INewSecret>(secretResource, secret);

      if (providerSecretAddResult.status === 201) {
        providerAddResults.push(providerSecretAddResult);

        Object.assign(provider.spec.secret, {
          name: providerSecretAddResult.data.metadata.name,
          namespace: providerSecretAddResult.data.metadata.namespace,
        });

        const providerAddResult = await client.create<ICommonProviderObject>(
          providerResource,
          provider
        );

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
        interface IRollbackObj {
          kind: string;
          name: string;
        }
        const rollbackObjs = providerAddResults.reduce(
          (
            rollbackAccum: IRollbackObj[],
            res: IKubeResponse<ICommonProviderObject | INewSecret>
          ) => {
            return res.status === 201
              ? [...rollbackAccum, { kind: res.data.kind, name: res.data.metadata.name || '' }]
              : rollbackAccum;
          },
          []
        );

        const rollbackResultPromises = await Q.allSettled(
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
            throw Error(providerAddResults.find((res) => res.state === 'rejected')?.reason);
          }
        });
      }
      return undefined;
    } catch (error) {
      // Something went wrong with rollback, not much we can do at this point
      // except inform the user about what's gone wrong so they can take manual action
      console.error('Failed to add provider.');
      throw error;
    }
  };

  return useMockableMutation<
    IKubeResponse<ICommonProviderObject> | undefined,
    KubeClientError,
    AddProviderFormValues
  >(postProvider, {
    onSuccess: () => {
      queryCache.invalidateQueries('providers');
      pollFasterAfterMutation();
      onSuccess();
    },
  });
};

export const useDeleteProviderMutation = (
  providerType: ProviderType,
  onSuccess?: () => void
): MutationResultPair<IKubeResponse<IKubeStatus>, KubeClientError, Provider, unknown> => {
  const client = useAuthorizedK8sClient();
  const queryCache = useQueryCache();
  return useMockableMutation<IKubeResponse<IKubeStatus>, KubeClientError, Provider>(
    async (provider: Provider) => {
      const providerResponse = await client.delete(providerResource, provider.name);
      await client.delete(secretResource, provider.object.spec.secret.name);
      return providerResponse;
    },
    {
      onSuccess: (_data, provider) => {
        // Optimistically remove this provider from the cache immediately
        queryCache.setQueryData(
          'providers',
          (oldData?: IProvidersByType) =>
            ({
              ...oldData,
              [providerType]: ((oldData ? oldData[providerType] : []) as Provider[]).filter(
                (p) => p.name !== provider.name
              ),
            } as IProvidersByType)
        );
        onSuccess && onSuccess();
      },
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

export const findProvidersByRefs = (
  refs: ISrcDestRefs | null,
  providersQuery: QueryResult<IProvidersByType>
): {
  sourceProvider: IVMwareProvider | null;
  targetProvider: IOpenShiftProvider | null;
} => {
  const sourceProvider =
    (refs &&
      providersQuery.data?.vsphere.find((provider) => isSameResource(provider, refs.source))) ||
    null;
  const targetProvider =
    (refs &&
      providersQuery.data?.openshift.find((provider) =>
        isSameResource(provider, refs.destination)
      )) ||
    null;
  return { sourceProvider, targetProvider };
};

export const getProviderNameSchema = (
  providersQuery: QueryResult<IProvidersByType>,
  providerType: ProviderType,
  providerBeingEdited: Provider | null
): yup.StringSchema =>
  dnsLabelNameSchema.test('unique-name', 'A provider with this name already exists', (value) => {
    if (providerBeingEdited?.name === value) return true;
    const providers: Provider[] = (providersQuery.data && providersQuery.data[providerType]) || [];
    if (providers.find((provider) => provider.name === value)) return false;
    return true;
  });
