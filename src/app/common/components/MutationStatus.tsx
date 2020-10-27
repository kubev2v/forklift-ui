import * as React from 'react';
import { Spinner, Alert, AlertActionCloseButton } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { MutationResult, QueryStatus } from 'react-query';
import { KubeClientError } from '@app/client/types';
import { getAggregateQueryStatus } from '@app/queries/helpers';

interface IMutationStatusProps {
  results: MutationResult<unknown>[];
  errorTitles: string[];
  isInline?: boolean;
  disableSpinner?: boolean;
  className?: string;
}

const MutationStatus = ({
  results,
  errorTitles,
  isInline = true,
  disableSpinner = false,
  className = '',
}: React.PropsWithChildren<IMutationStatusProps>): JSX.Element | null => {
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
                <AlertActionCloseButton aria-label="Dismiss error" onClose={result.reset} />
              }
            >
              {result.error ? (
                <>
                  {(result.error as Error).message || null}
                  {(result.error as KubeClientError).response ? (
                    <>
                      <br />
                      {(result.error as KubeClientError).response?.data.message}
                    </>
                  ) : null}
                </>
              ) : null}
            </Alert>
          ))
        : null}
    </div>
  );
};

export default MutationStatus;
