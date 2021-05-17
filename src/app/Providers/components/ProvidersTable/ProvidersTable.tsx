import * as React from 'react';
import { ProviderType } from '@app/common/constants';
import VMwareProvidersTable from './VMware/VMwareProvidersTable';
import OpenShiftProvidersTable from './OpenShift/OpenShiftProvidersTable';
import { IProviderObject, IProvidersByType } from '@app/queries/types';
import { correlateProviders } from './helpers';
import RHVProvidersTable from './RHV/RHVProvidersTable';

interface IProvidersTableProps {
  inventoryProvidersByType: IProvidersByType;
  clusterProviders: IProviderObject[];
  activeProviderType: ProviderType;
}

const ProvidersTable: React.FunctionComponent<IProvidersTableProps> = ({
  inventoryProvidersByType,
  clusterProviders,
  activeProviderType,
}) => {
  if (activeProviderType === ProviderType.vsphere) {
    return (
      <VMwareProvidersTable
        providers={correlateProviders(
          clusterProviders,
          inventoryProvidersByType.vsphere || [],
          ProviderType.vsphere
        )}
      />
    );
  }
  if (activeProviderType === ProviderType.ovirt) {
    return (
      <RHVProvidersTable
        providers={correlateProviders(
          clusterProviders,
          inventoryProvidersByType.ovirt || [],
          ProviderType.ovirt
        )}
      />
    );
  }
  if (activeProviderType === ProviderType.openshift) {
    return (
      <OpenShiftProvidersTable
        providers={correlateProviders(
          clusterProviders,
          inventoryProvidersByType.openshift || [],
          ProviderType.openshift
        )}
      />
    );
  }
  return null;
};

export default ProvidersTable;
