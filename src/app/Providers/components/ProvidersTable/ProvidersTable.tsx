import * as React from 'react';
import { ProviderType } from '@app/common/constants';
import VMwareProvidersTable from './VMware/VMwareProvidersTable';
import CNVProvidersTable from './CNV/CNVProvidersTable';
import { IProvidersByType } from '@app/queries/types';

interface IProvidersTableProps {
  providersByType: IProvidersByType;
  activeProviderType: ProviderType;
}

const ProvidersTable: React.FunctionComponent<IProvidersTableProps> = ({
  providersByType,
  activeProviderType,
}) => {
  if (activeProviderType === ProviderType.vsphere) {
    return <VMwareProvidersTable providers={providersByType.vsphere} />;
  }
  if (activeProviderType === ProviderType.cnv) {
    return <CNVProvidersTable providers={providersByType.cnv} />;
  }
  return null;
};

export default ProvidersTable;
