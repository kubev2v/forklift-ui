import * as React from 'react';
import { ProviderType } from '@app/common/constants';
import VMWareProvidersTable from './VMWare/VMWareProvidersTable';
import CNVProvidersTable from './CNV/CNVProvidersTable';
import { Provider, IVMWareProvider, ICNVProvider } from '@app/Providers/types';

interface IProvidersTableProps {
  providers: Provider[];
  activeProviderType: ProviderType;
}

// TODO implement selection state
// TODO implement compound expand state
// TODO implement "Select migration network" modal in VMWare table

const ProvidersTable: React.FunctionComponent<IProvidersTableProps> = ({
  providers,
  activeProviderType,
}) => {
  const filteredProviders = providers.filter(
    (provider) => provider.spec.type === activeProviderType
  );
  if (activeProviderType === ProviderType.vsphere) {
    return <VMWareProvidersTable providers={filteredProviders as IVMWareProvider[]} />;
  }
  if (activeProviderType === ProviderType.cnv) {
    return <CNVProvidersTable providers={filteredProviders as ICNVProvider[]} />;
  }
  return null;
};

export default ProvidersTable;
