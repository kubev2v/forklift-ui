import * as React from 'react';
import { QueryResult, MutationResult } from 'react-query';
import { MultiQueryResultStatus, IMultiQueryResultStatusProps } from './MultiQueryResultStatus';

export interface IQueryResultStatusProps
  extends Omit<IMultiQueryResultStatusProps, 'results' | 'errorTitles'> {
  result: QueryResult<unknown> | MutationResult<unknown>;
  errorTitle: string;
}

export const QueryResultStatus: React.FunctionComponent<IQueryResultStatusProps> = ({
  result,
  errorTitle,
  ...props
}: IQueryResultStatusProps) => (
  <MultiQueryResultStatus results={[result]} errorTitles={[errorTitle]} {...props} />
);
