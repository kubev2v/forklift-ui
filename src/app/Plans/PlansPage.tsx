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
import LoadingEmptyState from '@app/common/components/LoadingEmptyState';
import CreatePlanButton from './components/CreatePlanButton';
import { usePlansQuery } from '@app/queries/plans';

const PlansPage: React.FunctionComponent = () => {
  const sufficientProvidersQuery = useHasSufficientProvidersQuery();
  const plansQuery = usePlansQuery();

  return (
    <>
      <PageSection variant="light">
        <Title headingLevel="h1">Migration Plans</Title>
      </PageSection>
      <PageSection>
        {sufficientProvidersQuery.isLoading || plansQuery.isLoading ? (
          <LoadingEmptyState />
        ) : sufficientProvidersQuery.isError ? (
          <Alert variant="danger" isInline title="Error loading providers" />
        ) : plansQuery.isError ? (
          <Alert variant="danger" isInline title="Error loading plans" />
        ) : (
          <Card>
            <CardBody>
              {!plansQuery.data ? null : plansQuery.data.items.length === 0 ? (
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
                <PlansTable plans={plansQuery.data?.items || []} />
              )}
            </CardBody>
          </Card>
        )}
      </PageSection>
    </>
  );
};

export default PlansPage;
