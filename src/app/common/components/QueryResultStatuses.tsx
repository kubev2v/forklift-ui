import * as React from 'react';
import { Spinner, Alert, AlertActionCloseButton } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { MutationResult, QueryResult, QueryStatus } from 'react-query';
import { KubeClientError } from '@app/client/types';
import { getAggregateQueryStatus } from '@app/queries/helpers';

export interface IQueryResultStatusesProps {
  results: (QueryResult<unknown> | MutationResult<unknown>)[];
  errorTitles: string[];
  isInline?: boolean;
  disableSpinner?: boolean;
  className?: string;
}

const QueryResultStatuses = ({
  results,
  errorTitles,
  isInline = true,
  disableSpinner = false,
  className = '',
}: React.PropsWithChildren<IQueryResultStatusesProps>): JSX.Element | null => {
  const status = getAggregateQueryStatus(results);
  const erroredResults = results.filter((result) => result.isError);
  const filteredErrorTitles = errorTitles.filter((_title, index) => results[index].isError);

  return (
    <div>
      {status === QueryStatus.Loading && !disableSpinner ? (
        <Spinner size="lg" className={className} />
      ) : null}
      {status === QueryStatus.Error
        ? erroredResults.map((result, index) => (
            <Alert
              key={`error-${index}`}
              variant="danger"
              isInline={isInline}
              title={filteredErrorTitles[index]}
              className={`${index !== erroredResults.length - 1 ? spacing.mbMd : ''} ${className}`}
              actionClose={
                (result as { reset?: () => void }).reset ? (
                  <AlertActionCloseButton
                    aria-label="Dismiss error"
                    onClose={(result as MutationResult<unknown>).reset}
                  />
                ) : null
              }
            >
              {result.error ? (
                <>
                  {(result.error as Error).message || null}
                  {(result.error as KubeClientError).response ? (
                    <>
                      <br />
                      {(result.error as KubeClientError).response?.data?.message}
                    </>
                  ) : null}
                  {(result.error as Response).status
                    ? `${(result.error as Response).status}: ${
                        (result.error as Response).statusText
                      }`
                    : null}
                  {typeof result.error === 'string' ? result.error : null}
                </>
              ) : null}
            </Alert>
          ))
        : null}
    </div>
  );
};

export default QueryResultStatuses;
