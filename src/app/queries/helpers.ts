import {
  QueryConfig,
  QueryFunction,
  QueryKey,
  QueryResult,
  QueryStatus,
  useQuery,
} from 'react-query';

export const useMockableQuery = <TResult = unknown, TError = unknown>(
  queryKey: QueryKey,
  queryFn: QueryFunction<TResult>,
  mockData: TResult,
  queryConfig?: QueryConfig<TResult, TError> | undefined
): QueryResult<TResult, TError> => {
  const realQueryResult = useQuery<TResult, TError>(
    queryKey,
    process.env.DATA_SOURCE !== 'mock' ? queryFn : () => (undefined as unknown) as TResult,
    queryConfig
  );
  if (process.env.DATA_SOURCE !== 'mock') {
    return realQueryResult;
  } else {
    const mockQueryResult: QueryResult<TResult, TError> = {
      canFetchMore: undefined,
      clear: () => undefined,
      data: mockData,
      error: null,
      failureCount: 0,
      fetchMore: () => Promise.resolve(undefined),
      isError: false,
      isFetched: true,
      isFetchedAfterMount: true,
      isFetching: false,
      isIdle: queryConfig?.enabled === false || false,
      isInitialData: false,
      isLoading: false,
      isPreviousData: false,
      isStale: true,
      isSuccess: true,
      refetch: () => Promise.resolve(undefined),
      remove: () => undefined,
      status: QueryStatus.Success,
      updatedAt: new Date().getTime(),
    };
    return mockQueryResult;
  }
};
