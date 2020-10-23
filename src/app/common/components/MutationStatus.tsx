import * as React from 'react';
import { Spinner, Alert } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { MutationResult, QueryStatus } from 'react-query';
import { KubeClientError } from '@app/client/types';
import { getAggregateQueryStatus } from '@app/queries/helpers';

interface IMutationStatusProps {
  results: MutationResult<unknown>[];
  errorTitles: string[];
}

const MutationStatus = ({
  results,
  errorTitles,
}: React.PropsWithChildren<IMutationStatusProps>): JSX.Element | null => {
  const status = getAggregateQueryStatus(results);
  const erroredResults = results.filter((result) => result.isError);
  const filteredErrorTitles = errorTitles.filter((_title, index) => results[index].isError);
  return (
    <div>
      {status === QueryStatus.Loading ? <Spinner size="lg" /> : null}
      {status === QueryStatus.Error
        ? erroredResults.map((result, index) => (
            <Alert
              key={`error-${index}`}
              variant="danger"
              isInline
              title={filteredErrorTitles[index]}
              className={index !== erroredResults.length - 1 ? spacing.mbMd : ''}
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
