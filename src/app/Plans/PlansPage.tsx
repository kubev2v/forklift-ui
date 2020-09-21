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
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { PlusCircleIcon } from '@patternfly/react-icons';
import PlansTable from './components/PlansTable';
import AddTooltip, { IAddTooltipProps } from '@app/common/components/AddTooltip';
import { Provider } from '@app/queries/types';
import { ProviderType } from '@app/common/constants';
import PlanWizard from './components/Wizard/PlanWizard';

// TODO replace these with real state from react-query
import { MOCK_PLANS } from '@app/queries/mocks/plans.mock';
import { MOCK_PROVIDERS } from '@app/queries/mocks/providers.mock';

const IsFetchingInitialPlans = false; // Fetching for the first time, not polling
const migplans = MOCK_PLANS;
const providers = MOCK_PROVIDERS;

const PlansPage: React.FunctionComponent = () => {
  const vmwareList: Provider[] = providers.filter((x) => x.spec.type === ProviderType.vsphere);
  const cnvList: Provider[] = providers.filter((x) => x.spec.type === ProviderType.cnv);

  const [isWizardOpen, toggleWizard] = React.useReducer((isWizardOpen) => !isWizardOpen, false);

  let addPlanDisabledObj: Pick<IAddTooltipProps, 'isTooltipEnabled' | 'content'> = {
    isTooltipEnabled: false,
    content: '',
  };

  if (vmwareList.length < 1 || cnvList.length < 1) {
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
        {IsFetchingInitialPlans ? (
          <Bullseye>
            <EmptyState variant="large">
              <div className="pf-c-empty-state__icon">
                <Spinner size="xl" />
              </div>
              <Title headingLevel="h2">Loading...</Title>
            </EmptyState>
          </Bullseye>
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
        sourceProviders={vmwareList}
        targetProviders={cnvList}
      />
    </>
  );
};

export default PlansPage;
