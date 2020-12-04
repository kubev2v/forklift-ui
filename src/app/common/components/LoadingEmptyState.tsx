import { Bullseye, EmptyState, Spinner, SpinnerProps, Title } from '@patternfly/react-core';
import * as React from 'react';

interface ILoadingEmptyStateProps {
  className?: string;
  spinnerProps?: Partial<SpinnerProps>;
}

const LoadingEmptyState: React.FunctionComponent<ILoadingEmptyStateProps> = ({
  className = '',
  spinnerProps = {},
}: ILoadingEmptyStateProps) => (
  <Bullseye className={className}>
    <EmptyState variant="large">
      <div className="pf-c-empty-state__icon">
        <Spinner size="xl" {...spinnerProps} />
      </div>
      <Title headingLevel="h2">Loading...</Title>
    </EmptyState>
  </Bullseye>
);

export default LoadingEmptyState;
