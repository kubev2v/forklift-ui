import * as React from 'react';
import { ProviderType } from '@app/common/constants';
import VMwareProvidersTable from './VMware/VMwareProvidersTable';
import CNVProvidersTable from './CNV/CNVProvidersTable';
import { Provider, IVMwareProvider, ICNVProvider } from '@app/Providers/types';

interface IProvidersTableProps {
  providers: Provider[];
  activeProviderType: ProviderType;
}

// TODO implement selection state
// TODO implement compound expand state
// TODO implement "Select migration network" modal in VMware table

const ProvidersTable: React.FunctionComponent<IProvidersTableProps> = ({
  providers,
  activeProviderType,
}) => {
  const filteredProviders = providers.filter(
    (provider) => provider.spec.type === activeProviderType
  );
  if (activeProviderType === ProviderType.vsphere) {
    return <VMwareProvidersTable providers={filteredProviders as IVMwareProvider[]} />;
  }
  if (activeProviderType === ProviderType.cnv) {
    return <CNVProvidersTable providers={filteredProviders as ICNVProvider[]} />;
  }
  return null;
};

export default ProvidersTable;
