import * as React from 'react';
import { Spinner, Alert } from '@patternfly/react-core';
import { MutationResult } from 'react-query';

interface IMutationStatusProps<TError> {
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
      </Alert>
    ) : null}
  </div>
);

export default MutationStatus;
