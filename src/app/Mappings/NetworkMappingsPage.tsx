import * as React from 'react';
import { MappingType } from '@app/queries/types';
import MappingsPage from './MappingsPage';

const NetworkMappingsPage: React.FunctionComponent = () => (
  <MappingsPage mappingType={MappingType.Network} key="network" />
);

export default NetworkMappingsPage;
