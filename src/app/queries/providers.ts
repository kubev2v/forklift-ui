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
  nameAndNamespace,
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
  ForkliftResourceKind,
  providerResource,
  secretResource,
  convertFormValuesToProvider,
  convertFormValuesToSecret,
  checkIfResourceExists,
} from '@app/client/helpers';
import { AddProviderFormValues } from '@app/Providers/components/AddEditProviderModal/AddEditProviderModal';
import { dnsLabelNameSchema, ProviderType } from '@app/common/constants';
import { IKubeResponse, IKubeStatus, KubeClientError } from '@app/client/types';

export const useInventoryProvidersQuery = (): QueryResult<IProvidersByType> => {
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
    const providerWithoutSecret: ICommonProviderObject = convertFormValuesToProvider(
      values,
      providerType
    );
    await checkIfResourceExists(
      client,
      ForkliftResourceKind.Provider,
      providerResource,
      providerWithoutSecret.metadata.name
    );
    const secret: INewSecret = convertFormValuesToSecret(
      values,
      ForkliftResourceKind.Provider,
      null
    );

    const providerAddResults: Array<IKubeResponse<INewSecret | ICommonProviderObject>> = [];
    const providerSecretAddResult = await client.create<INewSecret>(secretResource, secret);

    if (providerSecretAddResult.status === 201) {
      providerAddResults.push(providerSecretAddResult);

      const providerWithSecret = {
        ...providerWithoutSecret,
        spec: {
          ...providerWithoutSecret.spec,
          secret: nameAndNamespace(providerSecretAddResult.data.metadata),
        },
      };

      const providerAddResult = await client.create<ICommonProviderObject>(
        providerResource,
        providerWithSecret
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
        (rollbackAccum: IRollbackObj[], res: IKubeResponse<ICommonProviderObject | INewSecret>) => {
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

export const usePatchProviderMutation = (
  providerType: ProviderType | null,
  providerBeingEdited: Provider | null,
  onSuccess?: () => void
): MutationResultPair<
  IKubeResponse<ICommonProviderObject> | undefined,
  KubeClientError,
  AddProviderFormValues,
  unknown
> => {
  const client = useAuthorizedK8sClient();
  const queryCache = useQueryCache();
  const { pollFasterAfterMutation } = usePollingContext();

  const patchProvider = async (values: AddProviderFormValues) => {
    const providerWithoutSecret: ICommonProviderObject = convertFormValuesToProvider(
      values,
      providerType
    );
    const providerWithSecret = {
      ...providerWithoutSecret,
      spec: {
        ...providerWithoutSecret.spec,
        secret: providerBeingEdited?.object.spec.secret,
      },
    };
    if (values.isReplacingCredentials) {
      const secret = convertFormValuesToSecret(
        values,
        ForkliftResourceKind.Provider,
        providerBeingEdited
      );
      await client.patch(secretResource, secret.metadata.name || '', secret);
    }
    return await client.patch<ICommonProviderObject>(
      providerResource,
      providerWithSecret.metadata.name,
      providerWithSecret
    );
  };

  return useMockableMutation<
    IKubeResponse<ICommonProviderObject> | undefined,
    KubeClientError,
    AddProviderFormValues
  >(patchProvider, {
    onSuccess: () => {
      queryCache.invalidateQueries('providers');
      pollFasterAfterMutation();
      onSuccess && onSuccess();
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
      await client.delete(secretResource, provider.object.spec.secret?.name || '');
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
