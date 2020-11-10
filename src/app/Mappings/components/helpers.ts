import * as React from 'react';
import { isSameResource } from '@app/queries/helpers';
import {
  INetworkMappingItem,
  IOpenShiftProvider,
  IProvidersByType,
  IStorageMappingItem,
  IVMwareProvider,
  Mapping,
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
    return 'Target networks';
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
  const [isDonePrefilling, setIsDonePrefilling] = React.useState(!mappingBeingEdited);
  React.useEffect(() => {
    if (
      mappingBeingEdited &&
      !form.isDirty &&
      providersQuery.isSuccess &&
      mappingResourceQueries.status === QueryStatus.Success
    ) {
      const { sourceProvider, targetProvider } = mappingBeingEditedProviders;
      const { availableSources, availableTargets } = mappingResourceQueries;

      form.fields.name.setValue(mappingBeingEdited.metadata.name);
      form.fields.name.setIsTouched(true);
      form.fields.sourceProvider.setValue(sourceProvider);
      form.fields.sourceProvider.setIsTouched(true);
      form.fields.targetProvider.setValue(targetProvider);
      form.fields.targetProvider.setIsTouched(true);

      form.fields.builderItems.setValue(
        getBuilderItemsFromMapping(
          mappingBeingEdited,
          mappingType,
          availableSources,
          availableTargets
        )
      );
      form.fields.builderItems.setIsTouched(true);

      // Wait for effects to run based on field changes first
      window.setTimeout(() => {
        setIsDonePrefilling(true);
      }, 0);
    }
  }, [
    form.fields,
    form.isDirty,
    mappingBeingEdited,
    mappingBeingEditedProviders,
    mappingResourceQueries,
    mappingType,
    providersQuery.isSuccess,
  ]);
  return { isDonePrefilling };
};
