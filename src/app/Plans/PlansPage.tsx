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
  Bullseye,
  Spinner,
  Alert,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { PlusCircleIcon } from '@patternfly/react-icons';

import AddTooltip, { IAddTooltipProps } from '@app/common/components/AddTooltip';
import { useProvidersQuery } from '@app/queries';

import PlansTable from './components/PlansTable';
import PlanWizard from './components/Wizard/PlanWizard';

// TODO replace these with real data from react-query
import { MOCK_PLANS } from '@app/queries/mocks/plans.mock';

const isFetchingInitialPlans = false; // Fetching for the first time, not polling
const migplans = MOCK_PLANS;

const PlansPage: React.FunctionComponent = () => {
  const providersQuery = useProvidersQuery();

  const vmwareProviders = providersQuery.data?.vsphere || [];
  const openshiftProviders = providersQuery.data?.openshift || [];

  const [isWizardOpen, toggleWizard] = React.useReducer((isWizardOpen) => !isWizardOpen, false);

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
          <Bullseye>
            <EmptyState variant="large">
              <div className="pf-c-empty-state__icon">
                <Spinner size="xl" />
              </div>
              <Title headingLevel="h2">Loading...</Title>
            </EmptyState>
          </Bullseye>
        ) : providersQuery.status === 'error' ? (
          <Alert variant="danger" title="Error loading providers" />
        ) : (
          <Card>
            <CardBody>
              {!migplans ? null : migplans.length === 0 ? (
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
                        isDisabled={addPlanDisabledObj.isTooltipEnabled}
                        onClick={toggleWizard}
                        variant="primary"
                      >
                        Create migration plan
                      </Button>
                    </div>
                  </AddTooltip>
                </EmptyState>
              ) : (
                <PlansTable planList={migplans} toggleAddWizardOpen={toggleWizard} />
              )}
            </CardBody>
          </Card>
        )}
      </PageSection>
      <PlanWizard
        isOpen={isWizardOpen}
        onClose={toggleWizard}
        sourceProviders={vmwareProviders}
        targetProviders={openshiftProviders}
      />
    </>
  );
};

export default PlansPage;
