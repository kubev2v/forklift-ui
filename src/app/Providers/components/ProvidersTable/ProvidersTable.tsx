import * as React from 'react';
import { ProviderType } from '@app/common/constants';
import VMWareProvidersTable from './VMWare/VMWareProvidersTable';
import CNVProvidersTable from './CNV/CNVProvidersTable';

interface IProvidersTableProps {
  providers: any[]; // TODO
  activeProviderType: ProviderType;
}

const ProvidersTable: React.FunctionComponent<IProvidersTableProps> = ({
  providers,
  activeProviderType,
}) => {
  const filteredProviders = providers.filter((provider) => true); // TODO filter by activeProviderType
  if (activeProviderType === ProviderType.vmware) {
    return <VMWareProvidersTable providers={filteredProviders} />;
  }
  if (activeProviderType === ProviderType.cnv) {
    return <CNVProvidersTable providers={filteredProviders} />;
  }
  return null;
};

export default ProvidersTable;
