import { ProviderType } from '@app/common/constants';
import { isSameResource } from '@app/queries/helpers';
import { InventoryProvider, ICorrelatedProvider, IProviderObject } from '@app/queries/types';

export const correlateProviders = <T extends InventoryProvider>(
  clusterProviders: IProviderObject[],
  inventoryProviders: T[],
  providerType: ProviderType
): ICorrelatedProvider<T>[] =>
  clusterProviders
    .filter((provider) => provider.spec.type === providerType)
    .map((provider) => ({
      ...provider,
      inventory:
        inventoryProviders.find((inventoryProvider) =>
          isSameResource(inventoryProvider, provider.metadata)
        ) || null,
    }));
