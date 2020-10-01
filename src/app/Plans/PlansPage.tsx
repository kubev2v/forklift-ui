import * as React from 'react';
import {
  Card,
  PageSection,
  CardBody,
  EmptyState,
  EmptyStateIcon,
  EmptyStateBody,
  Title,
  Button,
  Alert,
} from '@patternfly/react-core';
import { useHistory } from 'react-router-dom';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { PlusCircleIcon } from '@patternfly/react-icons';

import AddTooltip, { IAddTooltipProps } from '@app/common/components/AddTooltip';
import { useProvidersQuery } from '@app/queries';

import PlansTable from './components/PlansTable';

// TODO replace these with real data from react-query
import { MOCK_PLANS, MOCK_MIGRATIONS } from '@app/queries/mocks/plans.mock';
import LoadingEmptyState from '@app/common/components/LoadingEmptyState';

const isFetchingInitialPlans = false; // Fetching for the first time, not polling
const plans = MOCK_PLANS;
const migrations = MOCK_MIGRATIONS;

const PlansPage: React.FunctionComponent = () => {
  const history = useHistory();
  const providersQuery = useProvidersQuery();

  const vmwareProviders = providersQuery.data?.vsphere || [];
  const openshiftProviders = providersQuery.data?.openshift || [];

  let addPlanDisabledObj: Pick<IAddTooltipProps, 'isTooltipEnabled' | 'content'> = {
    isTooltipEnabled: false,
    content: '',
  };

  if (vmwareProviders.length < 1 || openshiftProviders.length < 1) {
    addPlanDisabledObj = {
      isTooltipEnabled: true,
      content:
        'You must add at least one VMware provider and one OpenShift Virtualization provider in order to create a migration plan.',
    };
  }

  return (
    <>
      <PageSection variant="light">
        <Title headingLevel="h1">Migration Plans</Title>
      </PageSection>
      <PageSection>
        {providersQuery.isLoading || isFetchingInitialPlans ? (
          <LoadingEmptyState />
        ) : providersQuery.isError ? (
          <Alert variant="danger" title="Error loading providers" />
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
                  <AddTooltip
                    isTooltipEnabled={addPlanDisabledObj.isTooltipEnabled}
                    content={addPlanDisabledObj.content}
                  >
                    <div className={`${spacing.mtMd}`}>
                      <Button
                        onClick={() => history.push('/plans/create')}
                        isDisabled={addPlanDisabledObj.isTooltipEnabled}
                        variant="primary"
                      >
                        Create migration plan
                      </Button>
                    </div>
                  </AddTooltip>
                </EmptyState>
              ) : (
                <PlansTable plans={plans} migrations={migrations} />
              )}
            </CardBody>
          </Card>
        )}
      </PageSection>
    </>
  );
};

export default PlansPage;
