import { Bullseye, EmptyState, Spinner, Title } from '@patternfly/react-core';
import * as React from 'react';

interface ILoadingEmptyStateProps {
  className?: string;
}

const LoadingEmptyState: React.FunctionComponent<ILoadingEmptyStateProps> = ({
  className = '',
}: ILoadingEmptyStateProps) => (
  <Bullseye className={className}>
    <EmptyState variant="large">
      <div className="pf-c-empty-state__icon">
        <Spinner size="xl" />
      </div>
      <Title headingLevel="h2">Loading...</Title>
    </EmptyState>
  </Bullseye>
);

export default LoadingEmptyState;
