import { MutationResultPair, queryCache, QueryResult, QueryStatus } from 'react-query';
import {
  IVMwareProvider,
  IOpenShiftProvider,
  MappingType,
  MappingSource,
  MappingTarget,
  Mapping,
  POD_NETWORK,
} from './types';
import { useStorageClassesQuery } from './storageClasses';
import {
  getAggregateQueryStatus,
  getFirstQueryError,
  mockKubeList,
  sortKubeResultsByName,
  useMockableMutation,
  useMockableQuery,
} from './helpers';
import { useOpenShiftNetworksQuery, useVMwareNetworksQuery } from './networks';
import { useDatastoresQuery } from './datastores';
import {
  checkIfResourceExists,
  useClientInstance,
  VirtResource,
  VirtResourceKind,
} from '@app/client/helpers';
import { VIRT_META } from '@app/common/constants';
import { KubeClientError, IKubeList } from '@app/client/types';
import { MOCK_NETWORK_MAPPINGS, MOCK_STORAGE_MAPPINGS } from './mocks/mappings.mock';
import { usePollingContext } from '@app/common/context';
import { POLLING_INTERVAL } from './constants';

const getMappingResource = (mappingType: MappingType) => {
  const kind =
    mappingType === MappingType.Network ? VirtResourceKind.NetworkMap : VirtResourceKind.StorageMap;
  const resource = new VirtResource(kind, VIRT_META.namespace);
  return { kind, resource };
};

export const useMappingsQuery = (mappingType: MappingType): QueryResult<IKubeList<Mapping>> => {
  const client = useClientInstance();
  const result = useMockableQuery<IKubeList<Mapping>>(
    {
      queryKey: `mappings:${mappingType}`,
      queryFn: async () => {
        const { resource } = getMappingResource(mappingType);
        const result = await client.list(resource);
        return result.data;
      },
      config: { refetchInterval: usePollingContext().isPollingEnabled ? POLLING_INTERVAL : false },
    },
    mappingType === MappingType.Network
      ? mockKubeList(MOCK_NETWORK_MAPPINGS, 'NetworkMapList')
      : mockKubeList(MOCK_STORAGE_MAPPINGS, 'StorageMapList')
  );
  return sortKubeResultsByName(result);
};

export const useCreateMappingMutation = (
  mappingType: MappingType,
  onSuccess: () => void
): MutationResultPair<
  Mapping,
  KubeClientError,
  Mapping,
  unknown // TODO replace `unknown` for TSnapshot? not even sure what this is for
> => {
  const client = useClientInstance();
  return useMockableMutation<Mapping, KubeClientError, Mapping>(
    async (mapping: Mapping) => {
      const { kind, resource } = getMappingResource(mappingType);
      await checkIfResourceExists(client, kind, resource, mapping.metadata.name);
      const result = await client.create(resource, mapping);
      console.log('mutation result: ', result);
      return result;
    },
    {
      onSuccess: () => {
        queryCache.invalidateQueries(`mappings:${mappingType}`);
        onSuccess();
      },
    }
  );
};

interface IMappingResourcesResult {
  availableSources: MappingSource[];
  availableTargets: MappingTarget[];
  isLoading: boolean;
  isError: boolean;
  status: QueryStatus;
  error: unknown; // TODO not sure how to handle error types yet
}

export const useMappingResourceQueries = (
  sourceProvider: IVMwareProvider | null,
  targetProvider: IOpenShiftProvider | null,
  mappingType: MappingType
): IMappingResourcesResult => {
  const vmwareNetworksQuery = useVMwareNetworksQuery(sourceProvider, mappingType);
  const datastoresQuery = useDatastoresQuery(sourceProvider, mappingType);
  const openshiftNetworksQuery = useOpenShiftNetworksQuery(targetProvider, mappingType);
  const storageClassesQuery = useStorageClassesQuery(
    targetProvider ? [targetProvider] : null,
    mappingType
  );

  let availableSources: MappingSource[] = [];
  let availableTargets: MappingTarget[] = [];
  if (mappingType === MappingType.Network) {
    availableSources = (sourceProvider && vmwareNetworksQuery.data) || [];
    availableTargets =
      targetProvider && openshiftNetworksQuery.data
        ? [POD_NETWORK, ...openshiftNetworksQuery.data]
        : [];
  }
  if (mappingType === MappingType.Storage) {
    availableSources = (sourceProvider && datastoresQuery.data) || [];
    availableTargets =
      (targetProvider &&
        storageClassesQuery.data &&
        storageClassesQuery.data[targetProvider.name]) ||
      [];
  }

  const queriesToWatch =
    mappingType === MappingType.Network
      ? [vmwareNetworksQuery, openshiftNetworksQuery]
      : [datastoresQuery, storageClassesQuery];
  const status = getAggregateQueryStatus(queriesToWatch);
  const error = getFirstQueryError(queriesToWatch);

  return {
    availableSources,
    availableTargets,
    isLoading: status === QueryStatus.Loading,
    isError: status === QueryStatus.Error,
    status,
    error,
  };
};
