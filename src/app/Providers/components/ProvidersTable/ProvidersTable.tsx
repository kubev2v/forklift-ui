import * as React from 'react';
import { ProviderType } from '@app/common/constants';
import VMwareProvidersTable from './VMware/VMwareProvidersTable';
import OpenShiftProvidersTable from './OpenShift/OpenShiftProvidersTable';
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
  if (activeProviderType === ProviderType.openshift) {
    return <OpenShiftProvidersTable providers={providersByType.openshift} />;
  }
  return null;
};

export default ProvidersTable;
