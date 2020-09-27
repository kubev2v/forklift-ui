import { QueryStatus } from 'react-query';
import {
  IVMwareProvider,
  IOpenShiftProvider,
  MappingType,
  MappingSource,
  MappingTarget,
} from './types';
import { useStorageClassesQuery } from './storageClasses';
import { MOCK_VMWARE_DATASTORES_BY_PROVIDER } from './mocks/datastores.mock';
import { getAggregateQueryStatus, getFirstQueryError } from './helpers';
import { useOpenShiftNetworksQuery, useVMwareNetworksQuery } from './networks';

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
  const openshiftNetworksQuery = useOpenShiftNetworksQuery(targetProvider);
  // TODO vmware datastores query
  const storageClassesQuery = useStorageClassesQuery(targetProvider ? [targetProvider] : null);

  let availableSources: MappingSource[] = [];
  let availableTargets: MappingTarget[] = [];
  if (mappingType === MappingType.Network) {
    availableSources = (sourceProvider && vmwareNetworksQuery.data) || [];
    availableTargets = (targetProvider && openshiftNetworksQuery.data) || [];
  }
  if (mappingType === MappingType.Storage) {
    availableSources = sourceProvider ? MOCK_VMWARE_DATASTORES_BY_PROVIDER.VCenter1 : []; // TODO use query data
    availableTargets =
      (targetProvider &&
        storageClassesQuery.data &&
        storageClassesQuery.data[targetProvider.name]) ||
      [];
  }

  const allQueries = [storageClassesQuery, vmwareNetworksQuery, openshiftNetworksQuery]; // TODO add the other queries
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
