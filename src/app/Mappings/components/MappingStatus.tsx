import { MappingType, Mapping } from '@app/queries/types';
import * as React from 'react';

interface IMappingStatusProps {
  mappingType: MappingType;
  mapping: Mapping;
}

const MappingStatus: React.FunctionComponent<IMappingStatusProps> = ({
  mappingType,
  mapping,
}: IMappingStatusProps) => <>TODO!</>;

export default MappingStatus;
