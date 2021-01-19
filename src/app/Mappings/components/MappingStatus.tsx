import * as React from 'react';
import { StatusIcon, StatusType } from '@konveyor/lib-ui';
import { QuerySpinnerMode, ResolvedQueries } from '@app/common/components/ResolvedQuery';
import { useResourceQueriesForMapping } from '@app/queries';
import { isSameResource } from '@app/queries/helpers';
import {
  MappingType,
  Mapping,
  MappingItem,
  IStorageMappingItem,
  INetworkMappingItem,
} from '@app/queries/types';

import './MappingStatus.css';

interface IMappingStatusProps {
  mappingType: MappingType;
  mapping: Mapping;
}

// TODO if invalid, prevent editing.
// TODO if invalid, prevent selecting in the wizard and show a warning?
// TODO if invalid, either prevent expandable content or edit MappingDetailView so it can show "missing" in place of the missing items.
// TODO factor out any shared logic between this, MappingActionsDropdown, and MappingDetailView.

const MappingStatus: React.FunctionComponent<IMappingStatusProps> = ({
  mappingType,
  mapping,
}: IMappingStatusProps) => {
  const { availableSources, availableTargets, queries } = useResourceQueriesForMapping(
    mappingType,
    mapping
  );
  const isMappingValid = (mapping.spec.map as MappingItem[]).every(
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
  return (
    <ResolvedQueries
      results={queries}
      errorTitles={[
        'Error loading providers',
        'Error loading source provider resources',
        'Error loading target provider resources',
      ]}
      spinnerMode={QuerySpinnerMode.Inline}
      spinnerProps={{
        size: 'md',
        className: 'status-spinner',
      }}
    >
      <StatusIcon
        status={isMappingValid ? StatusType.Ok : StatusType.Error}
        label={isMappingValid ? 'OK' : 'Invalid'}
      />
    </ResolvedQueries>
  );
};

export default MappingStatus;
