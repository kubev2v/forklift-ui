import { UseQueryObjectConfig, QueryResult, useQuery, QueryStatus } from 'react-query';

// TODO add useMockableMutation wrapper that just turns the mutation into a noop?
// TODO what about usePaginatedQuery, useInfiniteQuery?
// TODO what about alternate param signatures for useQuery?

const mockPromise = <TResult>(data: TResult, timeout = 1000, success = true) => {
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

export const useMockableQuery = <TResult = unknown, TError = unknown>(
  config: UseQueryObjectConfig<TResult, TError>,
  mockData: TResult
): QueryResult<TResult, TError> =>
  useQuery<TResult, TError>({
    ...config,
    queryFn: process.env.DATA_SOURCE !== 'mock' ? config.queryFn : () => mockPromise(mockData),
  });

export const getApiUrl = (relativePath: string): string =>
  `${process.env.REMOTE_API_URL}${relativePath}`;

export const getAggregateQueryStatus = (queryResults: QueryResult<unknown>[]): QueryStatus => {
  if (queryResults.some((result) => result.isError)) return QueryStatus.Error;
  if (queryResults.some((result) => result.isLoading)) return QueryStatus.Loading;
  if (queryResults.every((result) => result.isIdle)) return QueryStatus.Idle;
  if (queryResults.every((result) => result.isSuccess)) return QueryStatus.Success;
  return QueryStatus.Error; // Should never reach this, just makes TS happy
};

export const getFirstQueryError = <TError>(
  queryResults: QueryResult<unknown, TError>[]
): TError | null => {
  for (const result of queryResults) {
    if (result.isError) return result.error;
  }
  return null;
};
