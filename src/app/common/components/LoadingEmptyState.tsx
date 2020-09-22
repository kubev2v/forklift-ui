import { Bullseye, EmptyState, Spinner, Title } from '@patternfly/react-core';
import * as React from 'react';

const LoadingEmptyState: React.FunctionComponent = () => (
  <Bullseye>
    <EmptyState variant="large">
      <div className="pf-c-empty-state__icon">
        <Spinner size="xl" />
      </div>
      <Title headingLevel="h2">Loading...</Title>
    </EmptyState>
  </Bullseye>
);

export default LoadingEmptyState;
