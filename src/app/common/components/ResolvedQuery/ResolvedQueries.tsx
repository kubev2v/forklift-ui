import * as React from 'react';
import { MutationResult, QueryResult, QueryStatus } from 'react-query';
import {
  Spinner,
  Alert,
  AlertActionCloseButton,
  SpinnerProps,
  AlertProps,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { KubeClientError } from '@app/client/types';
import { getAggregateQueryStatus } from '@app/queries/helpers';
import LoadingEmptyState from '../LoadingEmptyState';

export enum QuerySpinnerMode {
  Inline = 'Inline',
  EmptyState = 'EmptyState',
  None = 'None',
}

export interface IResolvedQueriesProps {
  results: (QueryResult<unknown> | MutationResult<unknown>)[];
  errorTitles: string[];
  errorsInline?: boolean;
  spinnerMode?: QuerySpinnerMode;
  emptyStateBody?: React.ReactNode;
  spinnerProps?: Partial<SpinnerProps>;
  alertProps?: Partial<AlertProps>;
  className?: string;
  children?: React.ReactNode;
}

// TODO lib-ui candidate
export const ResolvedQueries: React.FunctionComponent<IResolvedQueriesProps> = ({
  results,
  errorTitles,
  errorsInline = true,
  spinnerMode = QuerySpinnerMode.EmptyState,
  emptyStateBody = null,
  spinnerProps = {},
  alertProps = {},
  className = '',
  children = null,
}: IResolvedQueriesProps) => {
  const status = getAggregateQueryStatus(results);
  const erroredResults = results.filter((result) => result.isError);
  const filteredErrorTitles = errorTitles.filter((_title, index) => results[index].isError);

  let spinner: React.ReactNode = null;
  if (spinnerMode === QuerySpinnerMode.Inline) {
    spinner = <Spinner size="lg" className={className} {...spinnerProps} />;
  } else if (spinnerMode === QuerySpinnerMode.EmptyState) {
    spinner = <LoadingEmptyState spinnerProps={spinnerProps} body={emptyStateBody} />;
  }

  return (
    <>
      {status === QueryStatus.Loading ? (
        spinner
      ) : status === QueryStatus.Error ? (
        <div>
          {erroredResults.map((result, index) => (
            <Alert
              key={`error-${index}`}
              variant="danger"
              isInline={errorsInline}
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
              {...alertProps}
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
          ))}
        </div>
      ) : (
        children
      )}
    </>
  );
};
