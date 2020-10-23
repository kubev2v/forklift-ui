import * as React from 'react';
import { MappingType } from '@app/queries/types';
import MappingsPage from './MappingsPage';

const StorageMappingsPage: React.FunctionComponent = () => (
  <MappingsPage mappingType={MappingType.Storage} key="storage" />
);

export default StorageMappingsPage;
