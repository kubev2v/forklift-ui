import { UseQueryObjectConfig, QueryResult, useQuery } from 'react-query';

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
