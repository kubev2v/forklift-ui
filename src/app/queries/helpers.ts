import * as React from 'react';
import { KubeClientError, IKubeList } from '@app/client/types';
import { CLUSTER_API_VERSION, PlanStatusType } from '@app/common/constants';
import { hasCondition } from '@app/common/helpers';
import {
  MutationConfig,
  UseQueryObjectConfig,
  QueryResult,
  useQuery,
  QueryStatus,
  useMutation,
  MutationResultPair,
  MutationFunction,
  MutationResult,
} from 'react-query';
import { useHistory } from 'react-router-dom';
import { useFetchContext } from './fetchHelpers';
import { INameNamespaceRef, IProviderObject, ISrcDestRefs } from './types';
import { VMwareTree } from './types/tree.types';

// TODO what about usePaginatedQuery, useInfiniteQuery?

const mockPromise = <TResult>(
  data: TResult,
  timeout = process.env.NODE_ENV === 'test' ? 0 : 1000,
  success = true
) => {
  return new Promise((resolve, reject) => {
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

export const useMockableQuery = <TResult = unknown, TError = unknown>(
  config: UseQueryObjectConfig<TResult, TError>,
  mockData: TResult
): QueryResult<TResult, TError> =>
  useQuery<TResult, TError>({
    ...config,
    queryFn: process.env.DATA_SOURCE !== 'mock' ? config.queryFn : () => mockPromise(mockData),
  });

export const useMockableMutation = <
  TResult = unknown,
  TError = KubeClientError,
  TVariables = unknown,
  TSnapshot = unknown
>(
  mutationFn: MutationFunction<TResult, TVariables>,
  config: MutationConfig<TResult, TError, TVariables, TSnapshot> | undefined
): MutationResultPair<TResult, TError, TVariables, TSnapshot> => {
  const { checkExpiry } = useFetchContext();
  const history = useHistory();
  return useMutation<TResult, TError, TVariables, TSnapshot>(
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

export const getAggregateQueryStatus = (
  queryResults: (QueryResult<unknown> | MutationResult<unknown>)[]
): QueryStatus => {
  if (queryResults.some((result) => result.isError)) return QueryStatus.Error;
  if (queryResults.some((result) => result.isLoading)) return QueryStatus.Loading;
  if (queryResults.every((result) => result.isIdle)) return QueryStatus.Idle;
  return QueryStatus.Success;
};

export const getFirstQueryError = <TError>(
  queryResults: QueryResult<unknown, TError>[]
): TError | null => {
  for (const result of queryResults) {
    if (result.isError) return result.error;
  }
  return null;
};

// Given a lookup object of keys to arrays of values,
// Returns a copy of the object with the values sorted.
export const sortIndexedData = <TItem, TIndexed>(
  data: TIndexed | undefined,
  getSortValue: (item: TItem) => string | number
): TIndexed | undefined =>
  data
    ? Object.keys(data || {}).reduce(
        (newObj, key) => ({
          ...newObj,
          [key]: (data || { [key]: [] })[key].sort((a: TItem, b: TItem) =>
            getSortValue(a) < getSortValue(b) ? -1 : 1
          ),
        }),
        {} as TIndexed
      )
    : undefined;

interface IHasName {
  name?: string;
  metadata?: { name: string };
}

export const sortByName = <T extends IHasName>(data?: T[]): T[] => {
  const getName = (obj: T) => obj.name || obj.metadata?.name || '';
  return (data || []).sort((a: T, b: T) => (getName(a) < getName(b) ? -1 : 1));
};

export const useResultsSortedByName = <T extends IHasName>(
  result: QueryResult<T[]>
): QueryResult<T[]> => ({
  ...result,
  data: React.useMemo(() => sortByName(result.data), [result.data]),
});

export const sortIndexedDataByName = <TItem extends { name: string }, TIndexed>(
  data: TIndexed | undefined
): TIndexed | undefined => sortIndexedData<TItem, TIndexed>(data, (item: TItem) => item.name);

export const useIndexedResultsSortedByName = <TIndexed>(
  result: QueryResult<TIndexed>
): QueryResult<TIndexed> => ({
  ...result,
  data: React.useMemo(() => sortIndexedDataByName(result.data), [result.data]),
});

export const useKubeResultsSortedByName = <T>(
  result: QueryResult<IKubeList<T>>
): QueryResult<IKubeList<T>> => ({
  ...result,
  data: React.useMemo(
    () =>
      result.data
        ? {
            ...result.data,
            items: sortByName(result.data.items || []),
          }
        : undefined,
    [result.data]
  ),
});

export const sortTreeItemsByName = <T extends VMwareTree>(tree?: T): T | undefined =>
  tree
    ? {
        ...tree,
        children:
          tree.children &&
          (tree.children as T[]).map(sortTreeItemsByName).sort((a?: T, b?: T) => {
            if (!a || !a.object) return -1;
            if (!b || !b.object) return 1;
            return a.object.name < b.object.name ? -1 : 1;
          }),
      }
    : undefined;

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
  clusterProvidersQuery: QueryResult<IKubeList<IProviderObject>>,
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
      hasCondition(provider.status?.conditions || [], PlanStatusType.Ready)
    );
  return areProvidersReady;
};
