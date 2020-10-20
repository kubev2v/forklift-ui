import { MutationResultPair, queryCache, QueryStatus } from 'react-query';
import {
  IVMwareProvider,
  IOpenShiftProvider,
  MappingType,
  MappingSource,
  MappingTarget,
  Mapping,
} from './types';
import { useStorageClassesQuery } from './storageClasses';
import { getAggregateQueryStatus, getFirstQueryError, useMockableMutation } from './helpers';
import { useOpenShiftNetworksQuery, useVMwareNetworksQuery } from './networks';
import { useDatastoresQuery } from './datastores';
import {
  checkIfResourceExists,
  useClientInstance,
  VirtResource,
  VirtResourceKind,
} from '@app/client/helpers';
import { VIRT_META } from '@app/common/constants';

// const const useMappingsQuery

export const useCreateMappingMutation = (
  mappingType: MappingType,
  onSuccess: () => void
): MutationResultPair<
  Mapping, // TODO: is Mapping really the TResult type var here? inspect the network response body to see?
  Error, // TODO is there a more specific exception type we may encounter with real network/API errors?
  Mapping, // TODO: not sure if the mapping we generate for variables here is the same as the one we get for a result?
  unknown // TODO replace `unknown` for TSnapshot? not even sure what this is for
> => {
  const client = useClientInstance();
  const kind =
    mappingType === MappingType.Network ? VirtResourceKind.NetworkMap : VirtResourceKind.StorageMap;
  return useMockableMutation<Mapping, Error, Mapping>(
    async (mapping: Mapping) => {
      const resource = new VirtResource(kind, VIRT_META.namespace);
      checkIfResourceExists(client, kind, resource, mapping.metadata.name);
      return await client.create(resource, mapping); // TODO do we need to check status codes here?
    },
    {
      onSuccess: () => {
        queryCache.invalidateQueries('mappings');
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
    availableTargets = (targetProvider && openshiftNetworksQuery.data) || [];
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
