import { UseQueryObjectConfig, QueryResult, useQuery } from 'react-query';

// TODO add useMockableMutation wrapper that just turns the mutation into a noop?
// TODO what about usePaginatedQuery, useInfiniteQuery?
// TODO what about alternate param signatures for useQuery?

export const useMockableQuery = <TResult = unknown, TError = unknown>(
  config: UseQueryObjectConfig<TResult, TError>,
  mockData: TResult
): QueryResult<TResult, TError> =>
  useQuery<TResult, TError>({
    ...config,
    queryFn: process.env.DATA_SOURCE !== 'mock' ? config.queryFn : () => Promise.resolve(mockData),
  });

export const getApiUrl = (relativePath: string): string =>
  `${process.env.REMOTE_API_URL}${relativePath}`;
