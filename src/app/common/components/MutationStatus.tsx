import * as React from 'react';
import { Spinner, Alert } from '@patternfly/react-core';
import { MutationResult } from 'react-query';
import { KubeClientError } from '@app/client/types';

interface IMutationStatusProps<TError = KubeClientError> {
  result: MutationResult<unknown, TError>;
  errorTitle: string;
}

const MutationStatus = <TError extends Error>({
  result,
  errorTitle,
}: React.PropsWithChildren<IMutationStatusProps<TError>>): JSX.Element | null => (
  <div>
    {result.isLoading ? <Spinner size="lg" /> : null}
    {result.isError ? (
      <Alert variant="danger" isInline title={errorTitle}>
        {result.error?.message}
        {result.error && ((result.error as unknown) as KubeClientError).response ? (
          <>
            <br />
            {((result.error as unknown) as KubeClientError).response?.data.message}
          </>
        ) : null}
      </Alert>
    ) : null}
  </div>
);

export default MutationStatus;
