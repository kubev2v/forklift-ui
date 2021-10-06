import * as React from 'react';
import { StatusIcon } from '@konveyor/lib-ui';
import { QuerySpinnerMode, ResolvedQueries } from '@app/common/components/ResolvedQuery';
import { useResourceQueriesForMapping } from '@app/queries';
import { MappingType, Mapping } from '@app/queries/types';

import './MappingStatus.css';
import { isMappingValid } from './helpers';
import { Button, Popover } from '@patternfly/react-core';

interface IMappingStatusProps {
  mappingType: MappingType;
  mapping: Mapping;
  isLabel?: boolean;
  disableOk?: boolean;
  className?: string;
}

const MappingStatus: React.FunctionComponent<IMappingStatusProps> = ({
  mappingType,
  mapping,
  isLabel = true,
  disableOk = false,
  className = '',
}: IMappingStatusProps) => {
  const { availableSources, availableTargets, queries } = useResourceQueriesForMapping(
    mappingType,
    mapping
  );
  const isValid = isMappingValid(mappingType, mapping, availableSources, availableTargets);
  const icon = (
    <StatusIcon
      status={isValid ? 'Ok' : 'Error'}
      label={isLabel ? (isValid ? 'OK' : 'Invalid') : null}
      className={className}
    />
  );
  return (
    <ResolvedQueries
      results={queries}
      errorTitles={[
        'Cannot load providers',
        'Cannot load source provider resources',
        'Cannot load target provider resources',
      ]}
      spinnerMode={QuerySpinnerMode.Inline}
      spinnerProps={{
        size: 'md',
        className: 'status-spinner',
      }}
    >
      {isValid ? (
        disableOk ? null : (
          icon
        )
      ) : (
        <Popover
          hasAutoWidth
          bodyContent="This mapping includes missing source or target resources"
        >
          <Button variant="link" isInline>
            {icon}
          </Button>
        </Popover>
      )}
    </ResolvedQueries>
  );
};

export default MappingStatus;
