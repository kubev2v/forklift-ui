import * as React from 'react';
import { ProviderType } from '@app/common/constants';
import SourceProvidersTable from './Source/SourceProvidersTable';
import OpenShiftProvidersTable from './OpenShift/OpenShiftProvidersTable';
import { IProviderObject, IProvidersByType } from '@app/queries/types';
import { correlateProviders } from './helpers';

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
  // We should be able to have the same <SourceProvidersTable> return for both vsphere and ovirt,
  // but TS couldn't properly infer the generic type for `correlateProviders`.
  if (activeProviderType === ProviderType.vsphere) {
    return (
      <SourceProvidersTable
        providers={correlateProviders(
          clusterProviders,
          inventoryProvidersByType.vsphere || [],
          activeProviderType
        )}
        providerType={activeProviderType}
      />
    );
  }
  if (activeProviderType === ProviderType.ovirt) {
    return (
      <SourceProvidersTable
        providers={correlateProviders(
          clusterProviders,
          inventoryProvidersByType.ovirt || [],
          activeProviderType
        )}
        providerType={activeProviderType}
      />
    );
  }
  if (activeProviderType === ProviderType.openshift) {
    return (
      <OpenShiftProvidersTable
        providers={correlateProviders(
          clusterProviders,
          inventoryProvidersByType.openshift || [],
          activeProviderType
        )}
      />
    );
  }
  return null;
};

export default ProvidersTable;
