import * as React from 'react';
import { ProviderType } from '@app/common/constants';
import VMWareProvidersTable from './VMWare/VMWareProvidersTable';
import CNVProvidersTable from './CNV/CNVProvidersTable';

interface IProvidersTableProps {
  providers: any[]; // TODO
  activeProviderType: ProviderType;
}

// TODO use mock data to implement actual dynamic rows
// TODO implement selection state
// TODO implement compound expand state
// TODO implement "Select migration network" modal in VMWare table

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
