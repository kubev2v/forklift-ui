import * as React from 'react';
import {
  PageSection,
  Title,
  Bullseye,
  EmptyState,
  Spinner,
  EmptyStateIcon,
  EmptyStateBody,
  Button,
  Card,
  CardBody,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { INetworkMapping } from '../types';
import MappingsTable from '../components/MappingsTable';

// TODO replace these with real state e.g. from redux
const isFetchingInitialNetworkMappings = false; // Fetching for the first time, not polling
const networkMappings: INetworkMapping[] = [];

const NetworkMappingsPage: React.FunctionComponent = () => (
  <>
    <PageSection variant="light">
      <Title headingLevel="h1" size="lg">
        Network mappings
      </Title>
    </PageSection>
    <PageSection>
      {isFetchingInitialNetworkMappings ? (
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
            {!networkMappings ? null : networkMappings.length === 0 ? (
              <EmptyState className={spacing.my_2xl}>
                <EmptyStateIcon icon={PlusCircleIcon} />
                <Title headingLevel="h2" size="lg">
                  No network mappings
                </Title>
                <EmptyStateBody>
                  Map source provider networks to target provider networks.
                </EmptyStateBody>
                <Button onClick={() => alert('TODO')} variant="primary">
                  Create mapping
                </Button>
              </EmptyState>
            ) : (
              <MappingsTable mappings={networkMappings} />
            )}
          </CardBody>
        </Card>
      )}
    </PageSection>
  </>
);

export default NetworkMappingsPage;
