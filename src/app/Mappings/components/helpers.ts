import * as React from 'react';
import { isSameResource } from '@app/queries/helpers';
import {
  INetworkMappingItem,
  IOpenShiftProvider,
  IProvidersByType,
  IStorageMappingItem,
  IVMwareProvider,
  Mapping,
  MappingItem,
  MappingSource,
  MappingTarget,
  MappingType,
} from '@app/queries/types';
import { MappingFormState } from './AddEditMappingModal';
import { QueryResult, QueryStatus } from 'react-query';
import { IMappingResourcesResult } from '@app/queries';
import { getBuilderItemsFromMapping } from './MappingBuilder/helpers';

export const getMappingSourceById = (sources: MappingSource[], id: string): MappingSource | null =>
  sources.find((source) => source.id === id) || null;

export const getMappingTargetByRef = (
  targets: MappingTarget[],
  ref: INetworkMappingItem['destination'] | IStorageMappingItem['destination'],
  mappingType: MappingType
): MappingTarget | null =>
  targets.find((target) => {
    if (mappingType === MappingType.Network) {
      const networkRef = ref as INetworkMappingItem['destination'];
      if (networkRef.type === 'pod') {
        return target.selfLink === 'pod';
      }
      return isSameResource(target, networkRef);
    }
    if (mappingType === MappingType.Storage) {
      const storageRef = ref as IStorageMappingItem['destination'];
      return target.name === storageRef.storageClass;
    }
    return null;
  }) || null;

export const getMappingSourceTitle = (mappingType: MappingType): string => {
  if (mappingType === MappingType.Network) {
    return 'Source networks';
  }
  if (mappingType === MappingType.Storage) {
    return 'Source datastores';
  }
  return '';
};

export const getMappingTargetTitle = (mappingType: MappingType): string => {
  if (mappingType === MappingType.Network) {
    return 'Target namespaces / networks';
  }
  if (mappingType === MappingType.Storage) {
    return 'Target storage classes';
  }
  return '';
};

export const useEditingMappingPrefillEffect = (
  form: MappingFormState,
  mappingBeingEdited: Mapping | null,
  mappingType: MappingType,
  mappingBeingEditedProviders: {
    sourceProvider: IVMwareProvider | null;
    targetProvider: IOpenShiftProvider | null;
  },
  providersQuery: QueryResult<IProvidersByType>,
  mappingResourceQueries: IMappingResourcesResult
): { isDonePrefilling: boolean } => {
  const [isStartedPrefilling, setIsStartedPrefilling] = React.useState(false);
  const [isDonePrefilling, setIsDonePrefilling] = React.useState(!mappingBeingEdited);
  React.useEffect(() => {
    if (
      !isStartedPrefilling &&
      mappingBeingEdited &&
      providersQuery.isSuccess &&
      mappingResourceQueries.status === QueryStatus.Success
    ) {
      setIsStartedPrefilling(true);
      const { sourceProvider, targetProvider } = mappingBeingEditedProviders;
      const { availableSources, availableTargets } = mappingResourceQueries;

      form.fields.name.setInitialValue(mappingBeingEdited.metadata.name);
      form.fields.sourceProvider.setInitialValue(sourceProvider);
      form.fields.targetProvider.setInitialValue(targetProvider);

      form.fields.builderItems.setInitialValue(
        getBuilderItemsFromMapping(
          mappingBeingEdited,
          mappingType,
          availableSources,
          availableTargets
        )
      );

      // Wait for effects to run based on field changes first
      window.setTimeout(() => {
        setIsDonePrefilling(true);
      }, 0);
    }
  }, [
    isStartedPrefilling,
    form.fields,
    mappingBeingEdited,
    mappingBeingEditedProviders,
    mappingResourceQueries,
    mappingType,
    providersQuery.isSuccess,
  ]);
  return { isDonePrefilling };
};

export const isMappingValid = (
  mappingType: MappingType,
  mapping: Mapping,
  availableSources: MappingSource[],
  availableTargets: MappingTarget[]
): boolean =>
  (mapping.spec.map as MappingItem[]).every(
    (mappingItem) =>
      availableSources.some((source) => source.id === mappingItem.source.id) &&
      availableTargets.some((target) => {
        if (mappingType === MappingType.Storage) {
          return target.name === (mappingItem as IStorageMappingItem).destination.storageClass;
        }
        if (mappingType === MappingType.Network) {
          const item = mappingItem as INetworkMappingItem;
          return item.destination.type === 'pod' || isSameResource(target, item.destination);
        }
        return false;
      })
  );
