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
  Tooltip,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { PlusCircleIcon } from '@patternfly/react-icons';
import PlansTable from './components/PlansTable';
import { IAddPlanDisabledObjModel } from './types';
import { Provider } from '@app/Providers/types';
import { ProviderType } from '@app/common/constants';
import WizardComponent from './components/Wizard/WizardComponent';

// TODO replace these with real state e.g. from redux
import { MOCK_PLANS } from './mocks/plans.mock';
import { MOCK_PROVIDERS } from '@app/Providers/mocks/providers.mock';
const IsFetchingInitialPlans = false; // Fetching for the first time, not polling
const migplans = MOCK_PLANS;
const providers = MOCK_PROVIDERS;

const PlansPage: React.FunctionComponent = () => {
  const vmwareList: Provider[] = providers.filter((x) => x.spec.type === ProviderType.vsphere);
  const cnvList: Provider[] = providers.filter((x) => x.spec.type === ProviderType.cnv);

  const [isWizardOpen, toggleWizard] = React.useReducer((isWizardOpen) => !isWizardOpen, false);

  let addPlanDisabledObj: IAddPlanDisabledObjModel = {
    isAddPlanDisabled: false,
    disabledText: 'Click to create a new migration plan',
  };

  if (vmwareList.length < 1) {
    addPlanDisabledObj = {
      isAddPlanDisabled: true,
      disabledText: 'At least 1 VMware provider is required to create a plan.',
    };
  }

  if (cnvList.length < 1) {
    addPlanDisabledObj = {
      isAddPlanDisabled: true,
      disabledText: 'At least 1 OpenShift provider is required to create a plan.',
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
                  <Tooltip position="top" content={<div>{addPlanDisabledObj.disabledText}</div>}>
                    <Button
                      isDisabled={addPlanDisabledObj.isAddPlanDisabled}
                      onClick={toggleWizard}
                      variant="primary"
                    >
                      Create migration plan
                    </Button>
                  </Tooltip>
                </EmptyState>
              ) : (
                <PlansTable
                  planList={migplans}
                  addPlanDisabledObj={addPlanDisabledObj}
                  toggleAddWizardOpen={toggleWizard}
                />
              )}
            </CardBody>
          </Card>
        )}
      </PageSection>
      <WizardComponent
        isOpen={isWizardOpen}
        onHandleWizardClose={toggleWizard}
        srcProviders={vmwareList}
        tgtProviders={cnvList}
      />
    </>
  );
};

export default PlansPage;
