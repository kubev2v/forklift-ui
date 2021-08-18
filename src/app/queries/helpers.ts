import { KubeClientError, IKubeList } from '@app/client/types';
import { CLUSTER_API_VERSION } from '@app/common/constants';
import { hasCondition } from '@app/common/helpers';
import {
  UseQueryOptions,
  UseQueryResult,
  UseMutationOptions,
  useQuery,
  QueryStatus,
  useMutation,
  MutationFunction,
} from 'react-query';
import { useHistory } from 'react-router-dom';
import { useFetchContext } from './fetchHelpers';
import { INameNamespaceRef, IProviderObject, ISrcDestRefs } from './types';
import { InventoryTree } from './types/tree.types';
import { UnknownResult } from '@app/common/types';

// TODO what about usePaginatedQuery, useInfiniteQuery?

const mockPromise = <TQueryFnData>(
  data: TQueryFnData,
  timeout = process.env.NODE_ENV === 'test' ? 0 : 1000,
  success = true
) => {
  return new Promise<TQueryFnData>((resolve, reject) => {
    setTimeout(() => {
      if (success) {
        resolve(data);
      } else {
        reject({ message: 'Error' });
      }
    }, timeout);
  });
};

export const mockKubeList = <T>(items: T[], kind: string): IKubeList<T> => ({
  apiVersion: CLUSTER_API_VERSION,
  items,
  kind,
  metadata: {
    continue: '',
    resourceVersion: '',
    selfLink: '/foo/list/selfLink',
  },
});

export const useMockableQuery = <TQueryFnData = unknown, TError = unknown, TData = TQueryFnData>(
  params: UseQueryOptions<TQueryFnData, TError, TData>,
  mockData: TQueryFnData
) =>
  useQuery<TQueryFnData, TError, TData>({
    ...params,
    queryFn: process.env.DATA_SOURCE !== 'mock' ? params.queryFn : () => mockPromise(mockData),
  });

export const useMockableMutation = <
  TQueryFnData = unknown,
  TError = KubeClientError,
  TVariables = unknown,
  TSnapshot = unknown
>(
  mutationFn: MutationFunction<TQueryFnData, TVariables>,
  config: UseMutationOptions<TQueryFnData, TError, TVariables, TSnapshot> | undefined
) => {
  const { checkExpiry } = useFetchContext();
  const history = useHistory();
  return useMutation<TQueryFnData, TError, TVariables, TSnapshot>(
    process.env.DATA_SOURCE !== 'mock'
      ? async (vars: TVariables) => {
          try {
            return await mutationFn(vars);
          } catch (error) {
            console.error(error.response);
            checkExpiry(error, history);
            throw error;
          }
        }
      : async () => {
          await mockPromise(undefined);
          throw new Error('This operation is not available in mock/preview mode');
        },
    config
  );
};
export const getInventoryApiUrl = (relativePath: string): string =>
  `/inventory-api/${relativePath}`;

export const getAggregateQueryStatus = (queryResults: UnknownResult[]): QueryStatus => {
  if (queryResults.some((result) => result.isError)) return 'error';
  if (queryResults.some((result) => result.isLoading)) return 'loading';
  if (queryResults.every((result) => result.isIdle)) return 'idle';
  return 'success';
};

export const getFirstQueryError = <TError>(
  queryResults: UseQueryResult<unknown, TError>[]
): TError | null => {
  for (const result of queryResults) {
    if (result.isError) return result.error;
  }
  return null;
};

// Given a lookup object of keys to arrays of values,
// Returns a copy of the object with the values sorted.
export const sortIndexedData = <TItem, TIndexed>(
  data: TIndexed,
  getSortValue: (item: TItem) => string | number
) =>
  Object.keys(data || {}).reduce(
    (newObj, key) => ({
      ...newObj,
      [key]: (data || { [key]: [] })[key].sort((a: TItem, b: TItem) =>
        getSortValue(a) < getSortValue(b) ? -1 : 1
      ),
    }),
    {} as TIndexed
  );

interface IHasName {
  name?: string;
  metadata?: { name: string };
}

export const sortByName = <T extends IHasName>(data?: T[]): T[] => {
  const getName = (obj: T) => obj.name || obj.metadata?.name || '';
  return (data || []).sort((a, b) => (getName(a) < getName(b) ? -1 : 1));
};

export const sortIndexedDataByName = <TItem extends { name: string }, TIndexed>(data: TIndexed) =>
  sortIndexedData<TItem, TIndexed>(data, (item: TItem) => item.name);

export const sortKubeListByName = <T>(result: IKubeList<T>) => ({
  ...result,
  items: sortByName(result.items || []),
});

export const sortTreeItemsByName = <T extends InventoryTree>(tree: T): T => ({
  ...tree,
  children:
    tree.children &&
    (tree.children as T[]).map(sortTreeItemsByName).sort((a?: T, b?: T) => {
      if (!a || !a.object) return -1;
      if (!b || !b.object) return 1;
      return a.object.name < b.object.name ? -1 : 1;
    }),
});

export const nameAndNamespace = (
  ref: Partial<INameNamespaceRef> | null | undefined
): INameNamespaceRef => ({
  name: ref?.name || '',
  namespace: ref?.namespace || '',
});

export const isSameResource = (
  refA: Partial<INameNamespaceRef> | null | undefined,
  refB: Partial<INameNamespaceRef> | null | undefined
): boolean => !!refA && !!refB && refA.name === refB.name && refA.namespace === refB.namespace;

export const areAssociatedProvidersReady = (
  clusterProvidersQuery: UseQueryResult<IKubeList<IProviderObject>>,
  providerRefs: ISrcDestRefs
): boolean => {
  const associatedProviders =
    clusterProvidersQuery.data?.items.filter(
      (provider) =>
        isSameResource(provider.metadata, providerRefs.source) ||
        isSameResource(provider.metadata, providerRefs.destination)
    ) || [];
  const areProvidersReady =
    associatedProviders.length === 2 &&
    associatedProviders.every((provider) =>
      hasCondition(provider.status?.conditions || [], 'Ready')
    );
  return areProvidersReady;
};
