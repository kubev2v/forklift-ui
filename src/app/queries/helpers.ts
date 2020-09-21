import { QueryConfig, QueryFunction, QueryKey, QueryResult, useQuery } from 'react-query';

export const useMockableQuery = <TResult = unknown, TError = unknown>(
  queryKey: QueryKey,
  queryFn: QueryFunction<TResult>,
  mockData: TResult,
  queryConfig?: QueryConfig<TResult, TError> | undefined
): QueryResult<TResult, TError> =>
  useQuery<TResult, TError>(
    queryKey,
    process.env.DATA_SOURCE !== 'mock' ? queryFn : () => Promise.resolve(mockData),
    queryConfig
  );
