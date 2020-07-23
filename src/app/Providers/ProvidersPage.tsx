import * as React from 'react';
import {
  PageSection,
  Title,
  Bullseye,
  EmptyState,
  Spinner,
  Card,
  CardBody,
  EmptyStateIcon,
  Button,
  EmptyStateBody,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

// TODO replace these flags with real state e.g. from redux
const isFetchingInitialProviders = false; // Fetching for the first time, not polling
const providers = [];

const ProvidersPage: React.FunctionComponent = () => (
  <>
    <PageSection variant="light">
      <Title headingLevel="h1">Providers</Title>
    </PageSection>
    <PageSection>
      {isFetchingInitialProviders ? (
        <Bullseye>
          <EmptyState>
            <div className="pf-c-empty-state__icon">
              <Spinner size="xl" />
            </div>
            <Title headingLevel="h2">Loading...</Title>
          </EmptyState>
        </Bullseye>
      ) : (
        <Card>
          <CardBody>
            {!providers ? null : providers.length === 0 ? (
              <EmptyState className={spacing.my_2xl}>
                <EmptyStateIcon icon={PlusCircleIcon} />
                <Title headingLevel="h2" size="lg">
                  No providers
                </Title>
                <EmptyStateBody>Add source and target providers for migrations.</EmptyStateBody>
                <Button
                  onClick={() => {
                    /* eslint-ignore */
                  }}
                  variant="primary"
                >
                  Add provider
                </Button>
              </EmptyState>
            ) : (
              'TODO: render ProvidersTable here'
            )}
          </CardBody>
        </Card>
      )}
    </PageSection>
  </>
);

export default ProvidersPage;
