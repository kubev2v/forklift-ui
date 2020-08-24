import * as React from 'react';
import { PageSection, Title } from '@patternfly/react-core';
import { TestComponent } from '@konveyor/common-ui';

const PlansPage: React.FunctionComponent = () => (
  <>
    <PageSection>
      <Title headingLevel="h1" size="lg">
        Plans Page Title
      </Title>
    </PageSection>
    <PageSection variant="light">
      <TestComponent theme="primary" />
    </PageSection>
  </>
);

export default PlansPage;
