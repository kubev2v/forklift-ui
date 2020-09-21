import { IProvidersByType } from '@app/queries/types';

export const checkAreProvidersEmpty = (providersByType: IProvidersByType): boolean =>
  !providersByType ||
  Object.keys(providersByType).length === 0 ||
  Object.keys(providersByType).every((key) => providersByType[key].length === 0);
