import { QueryStatus } from 'react-query';
import {
  IVMwareProvider,
  IOpenShiftProvider,
  MappingType,
  MappingSource,
  MappingTarget,
} from './types';
import { useStorageClassesQuery } from './storageClasses';
import { getAggregateQueryStatus, getFirstQueryError } from './helpers';
import { useOpenShiftNetworksQuery, useVMwareNetworksQuery } from './networks';
import { useDatastoresQuery } from './datastores';

// TODO actual useMappingsQuery bits

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
  const vmwareNetworksQuery = useVMwareNetworksQuery(sourceProvider);
  const datastoresQuery = useDatastoresQuery(sourceProvider);
  const openshiftNetworksQuery = useOpenShiftNetworksQuery(targetProvider);
  const storageClassesQuery = useStorageClassesQuery(targetProvider ? [targetProvider] : null);

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

  const allQueries = [
    vmwareNetworksQuery,
    datastoresQuery,
    openshiftNetworksQuery,
    storageClassesQuery,
  ];
  const status = getAggregateQueryStatus(allQueries);
  const error = getFirstQueryError(allQueries);

  return {
    availableSources,
    availableTargets,
    isLoading: status === QueryStatus.Loading,
    isError: status === QueryStatus.Error,
    status,
    error,
  };
};
