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
import { MOCK_VMWARE_NETWORKS, MOCK_OPENSHIFT_NETWORKS } from './mocks/networks.mock';

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
  // TODO vmware networks query
  // TODO openshift networks query
  // TODO vmware datastores query
  const storageClassesQuery = useStorageClassesQuery(targetProvider ? [targetProvider] : null);

  let availableSources: MappingSource[] = [];
  let availableTargets: MappingTarget[] = [];
  if (mappingType === MappingType.Network) {
    availableSources = sourceProvider ? MOCK_VMWARE_NETWORKS : []; // TODO use query data
    availableTargets = targetProvider ? MOCK_OPENSHIFT_NETWORKS : []; // TODO use query data
  }
  if (mappingType === MappingType.Storage) {
    availableSources = sourceProvider ? MOCK_VMWARE_DATASTORES_BY_PROVIDER.VCenter1 : []; // TODO use query data
    availableTargets =
      (targetProvider &&
        storageClassesQuery.data &&
        storageClassesQuery.data[targetProvider.name]) ||
      [];
  }

  const status = getAggregateQueryStatus([storageClassesQuery]); // TODO add the other queries
  const error = getFirstQueryError([storageClassesQuery]); // TODO add the other queries

  return {
    availableSources,
    availableTargets,
    isLoading: status === QueryStatus.Loading,
    isError: status === QueryStatus.Error,
    status,
    error,
  };
};
