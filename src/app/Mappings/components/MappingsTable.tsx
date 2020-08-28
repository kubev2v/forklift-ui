import * as React from 'react';
import { Mapping, MappingType, INetworkMapping, IStorageMapping } from '../types';

interface IMappingsTableProps {
  mappings: Mapping[];
}

const MappingsTable: React.FunctionComponent<IMappingsTableProps> = ({
  mappings,
}: IMappingsTableProps) => {
  // TODO: the storage and network mappings tables seem similar enough that we
  // can probably implement them in one place with props for the different sets
  // of data. Code specific to networks and storages could be in separate helpers.
  // If this turns out to be a pain, we could make NetworkMappingsTable
  // and StorageMappingsTable separately.

  // I wonder if we can make use of generics right in the props interface?
  // Might be overkill: https://wanago.io/2020/03/09/functional-react-components-with-generic-props-in-typescript/

  // TODO remove this stuff, just demonstrating how we can handle these types maybe?
  // These kind of checks can be in helpers instead of here.
  mappings.forEach((m) => {
    if (m.type === MappingType.Network) {
      const mapping = m as INetworkMapping;
      console.log('Do something with network mapping', mapping);
    }
    if (m.type === MappingType.Storage) {
      const mapping = m as IStorageMapping;
      console.log('Do something with storage mapping', mapping);
    }
    return {};
  });

  return <h1>TODO: table here</h1>;
};

export default MappingsTable;
