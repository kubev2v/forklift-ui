import * as React from 'react';
import {
  Card,
  PageSection,
  CardBody,
  EmptyState,
  EmptyStateIcon,
  EmptyStateBody,
  Title,
  Alert,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { PlusCircleIcon } from '@patternfly/react-icons';

import { useHasSufficientProvidersQuery } from '@app/queries';

import PlansTable from './components/PlansTable';

// TODO replace these with real data from react-query
import { MOCK_PLANS } from '@app/queries/mocks/plans.mock';
import LoadingEmptyState from '@app/common/components/LoadingEmptyState';
import CreatePlanButton from './components/CreatePlanButton';

// TODO replace these with real state from react-query results
const isFetchingInitialPlans = false; // Fetching for the first time, not polling
const isErrorFetchingPlans = false;

const plans = MOCK_PLANS;

const PlansPage: React.FunctionComponent = () => {
  const sufficientProvidersQuery = useHasSufficientProvidersQuery();

  return (
    <>
      <PageSection variant="light">
        <Title headingLevel="h1">Migration Plans</Title>
      </PageSection>
      <PageSection>
        {sufficientProvidersQuery.isLoading || isFetchingInitialPlans ? (
          <LoadingEmptyState />
        ) : sufficientProvidersQuery.isError ? (
          <Alert variant="danger" isInline title="Error loading providers" />
        ) : isErrorFetchingPlans ? (
          <Alert variant="danger" isInline title="Error loading plans" />
        ) : (
          <Card>
            <CardBody>
              {!plans ? null : plans.length === 0 ? (
                <EmptyState className={spacing.my_2xl}>
                  <EmptyStateIcon icon={PlusCircleIcon} />
                  <Title size="lg" headingLevel="h2">
                    No migration plans
                  </Title>
                  <EmptyStateBody>
                    Create a migration plan to select VMs to migrate to OpenShift Virtualization.
                  </EmptyStateBody>
                  <CreatePlanButton />
                </EmptyState>
              ) : (
                <PlansTable plans={plans} />
              )}
            </CardBody>
          </Card>
        )}
      </PageSection>
    </>
  );
};

export default PlansPage;
