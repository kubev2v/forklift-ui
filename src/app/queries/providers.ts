import { useQueryCache, QueryResult, MutationResultPair } from 'react-query';
import * as yup from 'yup';
import Q from 'q';

import { usePollingContext } from '@app/common/context';
import {
  useMockableQuery,
  getInventoryApiUrl,
  useMockableMutation,
  isSameResource,
  nameAndNamespace,
  mockKubeList,
  useIndexedResultsSortedByName,
} from './helpers';
import { MOCK_CLUSTER_PROVIDERS, MOCK_INVENTORY_PROVIDERS } from './mocks/providers.mock';
import {
  IProvidersByType,
  InventoryProvider,
  ISecret,
  IVMwareProvider,
  IOpenShiftProvider,
  ISrcDestRefs,
  IProviderObject,
  IMetaObjectMeta,
  IOpenShiftNetwork,
  POD_NETWORK,
} from './types';
import { useAuthorizedFetch, useAuthorizedK8sClient } from './fetchHelpers';
import {
  ForkliftResourceKind,
  providerResource,
  secretResource,
  convertFormValuesToProvider,
  convertFormValuesToSecret,
  checkIfResourceExists,
} from '@app/client/helpers';
import { AddProviderFormValues } from '@app/Providers/components/AddEditProviderModal/AddEditProviderModal';
import { dnsLabelNameSchema, ProviderType } from '@app/common/constants';
import { IKubeList, IKubeResponse, IKubeStatus, KubeClientError } from '@app/client/types';

export const useClusterProvidersQuery = (): QueryResult<IKubeList<IProviderObject>> => {
  const client = useAuthorizedK8sClient();
  return useMockableQuery<IKubeList<IProviderObject>>(
    {
      queryKey: 'cluster-providers',
      queryFn: async () => (await client.list<IKubeList<IProviderObject>>(providerResource)).data,
      config: {
        refetchInterval: usePollingContext().refetchInterval,
      },
    },
    mockKubeList(MOCK_CLUSTER_PROVIDERS, 'Providers')
  );
};

export const useInventoryProvidersQuery = (): QueryResult<IProvidersByType> => {
  const result = useMockableQuery<IProvidersByType>(
    {
      queryKey: 'inventory-providers',
      queryFn: useAuthorizedFetch(getInventoryApiUrl('/providers?detail=true')),
      config: { refetchInterval: usePollingContext().refetchInterval },
    },
    MOCK_INVENTORY_PROVIDERS
  );

  return useIndexedResultsSortedByName(result);
};

export const useCreateProviderMutation = (
  providerType: ProviderType | null,
  onSuccess: (navToProviderType?: ProviderType | null) => void
): MutationResultPair<
  IKubeResponse<IProviderObject> | undefined,
  KubeClientError,
  AddProviderFormValues,
  unknown // TODO replace `unknown` for TSnapshot? not even sure what this is for
> => {
  const client = useAuthorizedK8sClient();
  const queryCache = useQueryCache();
  const { pollFasterAfterMutation } = usePollingContext();

  const postProvider = async (values: AddProviderFormValues) => {
    const providerWithoutSecret: IProviderObject = convertFormValuesToProvider(
      values,
      providerType
    );
    await checkIfResourceExists(
      client,
      ForkliftResourceKind.Provider,
      providerResource,
      providerWithoutSecret.metadata.name
    );
    const secret: ISecret = convertFormValuesToSecret(values, ForkliftResourceKind.Provider, null);

    const providerAddResults: Array<IKubeResponse<ISecret | IProviderObject>> = [];
    const providerSecretAddResult = await client.create<ISecret>(secretResource, secret);

    if (providerSecretAddResult.status === 201) {
      providerAddResults.push(providerSecretAddResult);

      const providerWithSecret = {
        ...providerWithoutSecret,
        spec: {
          ...providerWithoutSecret.spec,
          secret: nameAndNamespace(providerSecretAddResult.data.metadata),
        },
      };

      const providerAddResult = await client.create<IProviderObject>(
        providerResource,
        providerWithSecret
      );

      if (providerAddResult.status === 201) {
        providerAddResults.push(providerAddResult);
      }

      const secretWithOwnerRef = convertFormValuesToSecret(
        values,
        ForkliftResourceKind.Provider,
        providerAddResult.data
      );
      await client.patch<ISecret>(
        secretResource,
        (secretWithOwnerRef.metadata as IMetaObjectMeta).name || '',
        secretWithOwnerRef
      );

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
        (rollbackAccum: IRollbackObj[], res: IKubeResponse<IProviderObject | ISecret>) => {
          return res.status === 201
            ? [
                ...rollbackAccum,
                { kind: res.data.kind, name: (res.data.metadata as IMetaObjectMeta).name || '' },
              ]
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
  };

  return useMockableMutation<
    IKubeResponse<IProviderObject> | undefined,
    KubeClientError,
    AddProviderFormValues
  >(postProvider, {
    onSuccess: () => {
      queryCache.invalidateQueries('cluster-providers');
      queryCache.invalidateQueries('inventory-providers');
      pollFasterAfterMutation();
      onSuccess(providerType);
    },
  });
};

export const usePatchProviderMutation = (
  providerType: ProviderType | null,
  providerBeingEdited: IProviderObject | null,
  onSuccess?: () => void
): MutationResultPair<
  IKubeResponse<IProviderObject> | undefined,
  KubeClientError,
  AddProviderFormValues,
  unknown
> => {
  const client = useAuthorizedK8sClient();
  const queryCache = useQueryCache();
  const { pollFasterAfterMutation } = usePollingContext();

  const patchProvider = async (values: AddProviderFormValues) => {
    const providerWithoutSecret: IProviderObject = convertFormValuesToProvider(
      values,
      providerType
    );
    const providerWithSecret = {
      ...providerWithoutSecret,
      spec: {
        ...providerWithoutSecret.spec,
        secret: providerBeingEdited?.spec.secret,
      },
    };
    const secret = convertFormValuesToSecret(
      values,
      ForkliftResourceKind.Provider,
      providerBeingEdited
    );
    await client.patch(secretResource, (secret.metadata as IMetaObjectMeta).name || '', secret);
    return await client.patch<IProviderObject>(
      providerResource,
      providerWithSecret.metadata.name,
      providerWithSecret
    );
  };

  return useMockableMutation<
    IKubeResponse<IProviderObject> | undefined,
    KubeClientError,
    AddProviderFormValues
  >(patchProvider, {
    onSuccess: () => {
      queryCache.invalidateQueries('cluster-providers');
      queryCache.invalidateQueries('inventory-providers');
      pollFasterAfterMutation();
      onSuccess && onSuccess();
    },
  });
};

export const useDeleteProviderMutation = (
  providerType: ProviderType,
  onSuccess?: () => void
): MutationResultPair<IKubeResponse<IKubeStatus>, KubeClientError, IProviderObject, unknown> => {
  const client = useAuthorizedK8sClient();
  const queryCache = useQueryCache();
  return useMockableMutation<IKubeResponse<IKubeStatus>, KubeClientError, IProviderObject>(
    (provider: IProviderObject) => client.delete(providerResource, provider.metadata.name),
    {
      onSuccess: (_data, provider) => {
        // Optimistically remove this provider from the cache immediately
        queryCache.setQueryData('cluster-providers', (oldData?: IKubeList<IProviderObject>) =>
          oldData
            ? {
                ...oldData,
                items: oldData.items.filter(
                  (item) => item.metadata.name !== provider.metadata.name
                ),
              }
            : mockKubeList([], 'Providers')
        );
        queryCache.setQueryData(
          'inventory-providers',
          (oldData?: IProvidersByType) =>
            ({
              ...oldData,
              [providerType]: ((oldData
                ? oldData[providerType]
                : []) as InventoryProvider[]).filter((p) => p.name !== provider.metadata.name),
            } as IProvidersByType)
        );
        onSuccess && onSuccess();
      },
    }
  );
};

export const useHasSufficientProvidersQuery = (): {
  result: QueryResult<IProvidersByType>;
  isLoading: boolean;
  isError: boolean;
  hasSufficientProviders: boolean | undefined;
} => {
  const result = useInventoryProvidersQuery();
  const vmwareProviders = result.data?.vsphere || [];
  const openshiftProviders = result.data?.openshift || [];
  const hasSufficientProviders = result.data
    ? vmwareProviders.length >= 1 && openshiftProviders.length >= 1
    : undefined;
  return {
    result: result,
    isLoading: result.isLoading,
    isError: result.isError,
    hasSufficientProviders,
  };
};

interface IProviderMigrationNetworkMutationVars {
  provider: IOpenShiftProvider | null;
  network: IOpenShiftNetwork | null;
}

export const useOCPMigrationNetworkMutation = (
  onSuccess?: () => void
): MutationResultPair<
  IKubeResponse<IProviderObject>,
  KubeClientError,
  IProviderMigrationNetworkMutationVars,
  unknown
> => {
  const client = useAuthorizedK8sClient();
  const queryCache = useQueryCache();
  return useMockableMutation<
    IKubeResponse<IProviderObject>,
    KubeClientError,
    IProviderMigrationNetworkMutationVars
  >(
    ({ provider, network }) => {
      if (!provider) return Promise.reject('No such provider');
      const networkName = (!isSameResource(network, POD_NETWORK) && network?.name) || null;
      const providerPatch: { metadata: Partial<IMetaObjectMeta> } = {
        metadata: {
          annotations: {
            ...provider?.object.metadata.annotations,
            'forklift.konveyor.io/defaultTransferNetwork': networkName || '',
          },
        },
      };
      return client.patch<IProviderObject>(providerResource, provider.name, providerPatch);
    },
    {
      onSuccess: () => {
        queryCache.invalidateQueries('cluster-providers');
        queryCache.invalidateQueries('inventory-providers');
        onSuccess && onSuccess();
      },
    }
  );
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
  clusterProvidersQuery: QueryResult<IKubeList<IProviderObject>>,
  providerBeingEdited: IProviderObject | null
): yup.StringSchema =>
  dnsLabelNameSchema.test('unique-name', 'A provider with this name already exists', (value) => {
    if (providerBeingEdited?.metadata.name === value) return true;
    const providers = clusterProvidersQuery.data?.items || [];
    if (providers.find((provider) => provider.metadata.name === value)) return false;
    return true;
  });
