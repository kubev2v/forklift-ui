import * as React from 'react';
import { QueryResult, MutationResult } from 'react-query';
import QueryResultStatuses, { IQueryResultStatusesProps } from './QueryResultStatuses';

export interface IQueryResultStatusProps
  extends Pick<IQueryResultStatusesProps, 'isInline' | 'disableSpinner' | 'className'> {
  result: QueryResult<unknown> | MutationResult<unknown>;
  errorTitle: string;
}

const QueryResultStatus: React.FunctionComponent<IQueryResultStatusProps> = ({
  result,
  errorTitle,
  ...props
}: IQueryResultStatusProps) => (
  <QueryResultStatuses results={[result]} errorTitles={[errorTitle]} {...props} />
);

export default QueryResultStatus;
