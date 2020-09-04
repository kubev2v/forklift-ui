import * as React from 'react';
import { MappingType } from '../types';
import {
  IVMwareNetwork,
  IVMwareDatastore,
  ICNVNetwork,
  IVMwareProvider,
  ICNVProvider,
} from '@app/Providers/types';

interface IMappingBuilderProps {
  mappingType: MappingType;
  sourceProvider: IVMwareProvider;
  targetProvider: ICNVProvider;
  availableSources: IVMwareNetwork[] | IVMwareDatastore[];
  availableTargets: ICNVNetwork[] | string[]; // strings = storage classes
}

const MappingBuilder: React.FunctionComponent<IMappingBuilderProps> = ({
  mappingType,
  sourceProvider,
  targetProvider,
  availableSources,
  availableTargets,
}: IMappingBuilderProps) => {
  console.log({ mappingType, sourceProvider, targetProvider, availableSources, availableTargets });
  return <h1>TODO: mapping builder</h1>;
};

export default MappingBuilder;
