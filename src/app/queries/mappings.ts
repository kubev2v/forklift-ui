import * as React from 'react';
import { UseMutationResult, useQueryClient, UseQueryResult, QueryStatus } from 'react-query';
import * as yup from 'yup';
import {
  IOpenShiftProvider,
  MappingType,
  MappingSource,
  MappingTarget,
  Mapping,
  POD_NETWORK,
  IMetaObjectMeta,
  SourceInventoryProvider,
} from './types';
import {
  getAggregateQueryStatus,
  getFirstQueryError,
  mockKubeList,
  sortKubeListByName,
  useMockableMutation,
  useMockableQuery,
} from './helpers';

import { checkIfResourceExists, ForkliftResource, ForkliftResourceKind } from '@app/client/helpers';
import { dnsLabelNameSchema, META } from '@app/common/constants';
import { KubeClientError, IKubeList, IKubeResponse, IKubeStatus } from '@app/client/types';
import { MOCK_NETWORK_MAPPINGS, MOCK_STORAGE_MAPPINGS } from './mocks/mappings.mock';
import { usePollingContext } from '@app/common/context';
import { useAuthorizedK8sClient } from './fetchHelpers';
import {
  useOpenShiftNetworksQuery,
  useSourceNetworksQuery,
  useSourceStoragesQuery,
  useStorageClassesQuery,
  findProvidersByRefs,
  useInventoryProvidersQuery,
} from '@app/queries';

export const getMappingResource = (
  mappingType: MappingType
): { kind: ForkliftResourceKind; resource: ForkliftResource } => {
  const kind =
    mappingType === MappingType.Network
      ? ForkliftResourceKind.NetworkMap
      : ForkliftResourceKind.StorageMap;
  const resource = new ForkliftResource(kind, META.namespace);
  return { kind, resource };
};

export const useMappingsQuery = (mappingType: MappingType): UseQueryResult<IKubeList<Mapping>> => {
  const client = useAuthorizedK8sClient();
  const sortKubeListByNameCallback = React.useCallback(
    (data): IKubeList<Mapping> => sortKubeListByName(data),
    []
  );
  const result = useMockableQuery<IKubeList<Mapping>>(
    {
      queryKey: ['mappings', mappingType],
      queryFn: async () =>
        (await client.list<IKubeList<Mapping>>(getMappingResource(mappingType).resource)).data,
      refetchInterval: usePollingContext().refetchInterval,
      select: sortKubeListByNameCallback,
    },
    mappingType === MappingType.Network
      ? mockKubeList(MOCK_NETWORK_MAPPINGS, 'NetworkMapList')
      : mockKubeList(MOCK_STORAGE_MAPPINGS, 'StorageMapList')
  );
  return result;
};

export const useCreateMappingMutation = (
  mappingType: MappingType,
  onSuccess?: () => void
): UseMutationResult<
  IKubeResponse<Mapping>,
  KubeClientError,
  Mapping,
  unknown // TODO replace `unknown` for TSnapshot? not even sure what this is for
> => {
  const client = useAuthorizedK8sClient();
  const queryClient = useQueryClient();
  return useMockableMutation<IKubeResponse<Mapping>, KubeClientError, Mapping>(
    async (mapping) => {
      const { kind, resource } = getMappingResource(mappingType);
      const existingMappingName = (mapping.metadata as IMetaObjectMeta).name || null;
      if (existingMappingName) {
        await checkIfResourceExists(client, kind, resource, existingMappingName);
      }
      return await client.create<Mapping>(resource, mapping);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['mappings', mappingType]);
        onSuccess && onSuccess();
      },
    }
  );
};

export const useCreateMappingMutations = (): {
  network: ReturnType<typeof useCreateMappingMutation>;
  storage: ReturnType<typeof useCreateMappingMutation>;
} => ({
  network: useCreateMappingMutation(MappingType.Network),
  storage: useCreateMappingMutation(MappingType.Storage),
});

export const usePatchMappingMutation = (
  mappingType: MappingType,
  onSuccess?: () => void
): UseMutationResult<IKubeResponse<Mapping>, KubeClientError, Mapping, unknown> => {
  const client = useAuthorizedK8sClient();
  const queryClient = useQueryClient();
  return useMockableMutation<IKubeResponse<Mapping>, KubeClientError, Mapping>(
    async (mapping: Mapping) => {
      const { resource } = getMappingResource(mappingType);
      return await client.patch(resource, (mapping.metadata as IMetaObjectMeta).name, mapping);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['mappings', mappingType]);
        onSuccess && onSuccess();
      },
    }
  );
};

export const usePatchMappingMutations = (): {
  network: ReturnType<typeof usePatchMappingMutation>;
  storage: ReturnType<typeof usePatchMappingMutation>;
} => ({
  network: usePatchMappingMutation(MappingType.Network),
  storage: usePatchMappingMutation(MappingType.Storage),
});

export const useDeleteMappingMutation = (mappingType: MappingType, onSuccess?: () => void) => {
  const client = useAuthorizedK8sClient();
  const { resource } = getMappingResource(mappingType);
  const queryClient = useQueryClient();
  return useMockableMutation<IKubeResponse<IKubeStatus>, KubeClientError, Mapping>(
    (mapping: Mapping) => client.delete(resource, (mapping.metadata as IMetaObjectMeta).name),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['mappings', mappingType]);
        onSuccess && onSuccess();
      },
    }
  );
};

export interface IMappingResourcesResult {
  availableSources: MappingSource[];
  availableTargets: MappingTarget[];
  isLoading: boolean;
  isError: boolean;
  status: QueryStatus;
  error: unknown; // TODO not sure how to handle error types yet
  queries: UseQueryResult<unknown>[];
}

export interface ISpecificMappingResourcesResult extends IMappingResourcesResult {
  sourceProvider: SourceInventoryProvider | null;
  targetProvider: IOpenShiftProvider | null;
}

export const useMappingResourceQueries = (
  sourceProvider: SourceInventoryProvider | null,
  targetProvider: IOpenShiftProvider | null,
  mappingType: MappingType,
  targetNamespace?: string | null
): IMappingResourcesResult => {
  const sourceNetworksQuery = useSourceNetworksQuery(sourceProvider, mappingType);
  const sourceStoragesQuery = useSourceStoragesQuery(sourceProvider, mappingType);
  const openshiftNetworksQuery = useOpenShiftNetworksQuery(targetProvider, mappingType);
  const storageClassesQuery = useStorageClassesQuery(
    targetProvider ? [targetProvider] : null,
    mappingType
  );

  const allOpenshiftNetworks = openshiftNetworksQuery.data || [];
  const filteredOpenshiftNetworks = targetNamespace
    ? allOpenshiftNetworks.filter((network) => network.namespace === targetNamespace)
    : allOpenshiftNetworks;

  let availableSources: MappingSource[] = [];
  let availableTargets: MappingTarget[] = [];
  if (mappingType === MappingType.Network) {
    availableSources = (sourceProvider && sourceNetworksQuery.data) || [];
    availableTargets =
      targetProvider && openshiftNetworksQuery.data
        ? [POD_NETWORK, ...filteredOpenshiftNetworks]
        : [];
  }
  if (mappingType === MappingType.Storage) {
    availableSources = (sourceProvider && sourceStoragesQuery.data) || [];
    availableTargets =
      (targetProvider &&
        storageClassesQuery.data &&
        storageClassesQuery.data[targetProvider.name]) ||
      [];
  }

  const queriesToWatch =
    mappingType === MappingType.Network
      ? [sourceNetworksQuery, openshiftNetworksQuery]
      : [sourceStoragesQuery, storageClassesQuery];
  const status = getAggregateQueryStatus(queriesToWatch);
  const error = getFirstQueryError(queriesToWatch);

  return {
    availableSources,
    availableTargets,
    isLoading: status === 'loading',
    isError: status === 'error',
    status,
    error,
    queries: queriesToWatch,
  };
};

export const useResourceQueriesForMapping = (
  mappingType: MappingType,
  mapping: Mapping | null
): ISpecificMappingResourcesResult => {
  const providersQuery = useInventoryProvidersQuery();
  const { sourceProvider, targetProvider } = findProvidersByRefs(
    mapping?.spec.provider || null,
    providersQuery
  );
  const mappingResourceQueries = useMappingResourceQueries(
    sourceProvider,
    targetProvider,
    mappingType
  );
  const allQueries = [providersQuery, ...mappingResourceQueries.queries];
  const status = getAggregateQueryStatus(allQueries);
  const error = getFirstQueryError(allQueries);
  return {
    ...mappingResourceQueries,
    queries: allQueries,
    isLoading: status === 'loading',
    isError: status === 'error',
    status,
    error,
    sourceProvider,
    targetProvider,
  };
};

export const getMappingNameSchema = (
  mappingsQuery: UseQueryResult<IKubeList<Mapping>>,
  mappingBeingEdited: Mapping | null
): yup.StringSchema =>
  dnsLabelNameSchema.test('unique-name', 'A mapping with this name already exists', (value) => {
    if (mappingBeingEdited && (mappingBeingEdited.metadata as IMetaObjectMeta).name === value)
      return true;
    if (
      mappingsQuery.data?.items.find(
        (mapping) => mapping && (mapping.metadata as IMetaObjectMeta).name === value
      )
    )
      return false;
    return true;
  });

export const filterSharedMappings = (mappings?: Mapping[]): Mapping[] =>
  (mappings || []).filter(
    (mapping) => mapping.metadata.annotations?.['forklift.konveyor.io/shared'] !== 'false'
  ) || null;
