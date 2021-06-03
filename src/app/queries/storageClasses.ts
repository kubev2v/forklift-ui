import { QueryResult } from 'react-query';
import { usePollingContext } from '@app/common/context';
import { useMockableQuery, getInventoryApiUrl } from './helpers';
import {
  IAnnotatedStorageClass,
  IByProvider,
  IOpenShiftProvider,
  IProvisioner,
  IStorageClass,
  MappingType,
} from './types';
import { MOCK_STORAGE_CLASSES_BY_PROVIDER } from './mocks/storageClasses.mock';
import { authorizedFetch, useFetchContext } from './fetchHelpers';
import { useProvisionersQuery } from '.';

const annotateStorageClasses = (
  storageClasses: IStorageClass[],
  provisioners: IProvisioner[]
): IAnnotatedStorageClass[] =>
  storageClasses
    .map((storageClass) => ({
      ...storageClass,
      uiMeta: {
        hasProvisioner:
          !!storageClass.object.provisioner &&
          !!provisioners.find((prov) => prov.spec.name === storageClass.object.provisioner),
        isDefault:
          storageClass.object.metadata.annotations?.[
            'storageclass.kubernetes.io/is-default-class'
          ] === 'true',
      },
    }))
    .sort((a, b) => {
      // Always put the default at the top
      if (a.uiMeta.isDefault && !b.uiMeta.isDefault) return -1;
      if (b.uiMeta.isDefault && !a.uiMeta.isDefault) return 1;
      return 0;
    });

export const useStorageClassesQuery = (
  providers: (IOpenShiftProvider | null)[] | null,
  mappingType: MappingType
): QueryResult<IByProvider<IAnnotatedStorageClass>> => {
  const fetchContext = useFetchContext();
  const definedProviders = providers
    ? (providers.filter((provider) => !!provider) as IOpenShiftProvider[])
    : [];
  const provisionersQuery = useProvisionersQuery();
  const result = useMockableQuery<IByProvider<IAnnotatedStorageClass>>(
    {
      // Key by the provider names combined, so it refetches if the list of providers changes
      queryKey: ['storageClasses', ...definedProviders.map((provider) => provider.name)],
      // Fetch multiple resources in one query via Promise.all()
      queryFn: async () => {
        const storageClassLists: IStorageClass[][] = await Promise.all(
          (providers || []).map((provider) =>
            authorizedFetch<IStorageClass[]>(
              getInventoryApiUrl(`${provider?.selfLink || ''}/storageclasses?detail=1`),
              fetchContext
            )
          )
        );
        return definedProviders.reduce(
          (newObj, provider, index) => ({
            ...newObj,
            [provider.name]: annotateStorageClasses(
              storageClassLists[index],
              provisionersQuery.data?.items || []
            ),
          }),
          {} as IByProvider<IAnnotatedStorageClass>
        );
      },
      config: {
        enabled:
          !!providers &&
          providers.length > 0 &&
          mappingType === MappingType.Storage &&
          !!provisionersQuery.data,
        refetchInterval: usePollingContext().refetchInterval,
      },
    },
    MOCK_STORAGE_CLASSES_BY_PROVIDER
  );
  return result;
};
