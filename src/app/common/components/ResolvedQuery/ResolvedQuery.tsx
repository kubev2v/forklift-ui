import * as React from 'react';
import { QueryResult, MutationResult } from 'react-query';
import { ResolvedQueries, IResolvedQueriesProps } from './ResolvedQueries';

export interface IResolvedQueryProps
  extends Omit<IResolvedQueriesProps, 'results' | 'errorTitles'> {
  result: QueryResult<unknown> | MutationResult<unknown>;
  errorTitle: string;
}

// TODO lib-ui candidate
export const ResolvedQuery: React.FunctionComponent<IResolvedQueryProps> = ({
  result,
  errorTitle,
  ...props
}: IResolvedQueryProps) => (
  <ResolvedQueries results={[result]} errorTitles={[errorTitle]} {...props} />
);
