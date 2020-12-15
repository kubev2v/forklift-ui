import * as React from 'react';
import { ProviderType } from '@app/common/constants';
import VMwareProvidersTable from './VMware/VMwareProvidersTable';
import OpenShiftProvidersTable from './OpenShift/OpenShiftProvidersTable';
import {
  ICorrelatedProvider,
  InventoryProvider,
  IProviderObject,
  IProvidersByType,
} from '@app/queries/types';
import { isSameResource } from '@app/queries/helpers';

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
  const correlateProviders = <T extends InventoryProvider>(
    inventoryProviders: T[]
  ): ICorrelatedProvider<T>[] =>
    clusterProviders
      .filter((provider) => provider.spec.type === activeProviderType)
      .map((provider) => ({
        ...provider,
        inventory:
          inventoryProviders.find((inventoryProvider) =>
            isSameResource(inventoryProvider, provider.metadata)
          ) || null,
      }));

  if (activeProviderType === ProviderType.vsphere) {
    return (
      <VMwareProvidersTable
        providers={correlateProviders(inventoryProvidersByType.vsphere || [])}
      />
    );
  }
  if (activeProviderType === ProviderType.openshift) {
    return (
      <OpenShiftProvidersTable
        providers={correlateProviders(inventoryProvidersByType.openshift || [])}
      />
    );
  }
  return null;
};

export default ProvidersTable;
