import * as React from 'react';
import {
  Card,
  PageSection,
  CardBody,
  EmptyState,
  EmptyStateIcon,
  Title,
  Button,
  Bullseye,
  Spinner,
  Tooltip,
} from '@patternfly/react-core';
import { AddCircleOIcon } from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import PlansTable from './components/PlansTable';
import { IAddPlanDisabledObjModel } from './types';

// TODO replace these with real state e.g. from redux
import { MOCK_PLANS } from './mocks/plans.mock';
import { MOCK_PROVIDERS } from '@app/Providers/mocks/providers.mock';
const IsFetchingInitialPlans = false; // Fetching for the first time, not polling
const migplans = MOCK_PLANS;
const providers = MOCK_PROVIDERS;

const PlansPage: React.FunctionComponent = () => {
  const VMWareList = providers.map((x) => x.spec.type === 'vsphere');
  const CNVList = providers.map((x) => x.spec.type === 'cnv');

  const [isWizardOpen, toggleWizard] = React.useReducer(() => !isWizardOpen, false);

  const [addPlanDisabledObj, setAddPlanDisabledObj] = React.useState<IAddPlanDisabledObjModel>({
    isAddPlanDisabled: true,
    disabledText: '',
  });

  React.useEffect(() => {
    if (VMWareList.length < 1) {
      setAddPlanDisabledObj({
        isAddPlanDisabled: true,
        disabledText: 'At least 1 VMWare provider is required to create a plan.',
      });
      return;
    }

    if (CNVList.length < 1) {
      setAddPlanDisabledObj({
        isAddPlanDisabled: true,
        disabledText: 'At least 1 OpenShift provider is required to create a plan.',
      });
      return;
    }

    setAddPlanDisabledObj({
      isAddPlanDisabled: false,
      disabledText: 'Create a migration plan to select VMs to migrate to OpenShift virtualization.',
    });
  }, [VMWareList, CNVList]);

  return (
    <>
      <PageSection>
        <Title headingLevel="h1" size="lg">
          Migration Plans
        </Title>
      </PageSection>
      <PageSection variant="light">
        {IsFetchingInitialPlans ? (
          <Bullseye>
            <EmptyState variant="large">
              <div className="pf-c-empty-state__icon">
                <Spinner size="xl" />
              </div>
              <Title headingLevel="h2" size="xl">
                Loading...
              </Title>
            </EmptyState>
          </Bullseye>
        ) : (
          <Card>
            <CardBody>
              {!migplans ? null : migplans.length === 0 ? (
                <EmptyState variant="full">
                  <EmptyStateIcon icon={AddCircleOIcon} />
                  {/* TODO: fix className issue */}
                  <Title size="lg" headingLevel="h2" /* className={spacing.mbLg}> */>
                    No migration plans
                  </Title>
                  <Tooltip position="top" content={<div>{addPlanDisabledObj.disabledText}</div>}>
                    <div>
                      <Button
                        isDisabled={addPlanDisabledObj.isAddPlanDisabled}
                        onClick={toggleWizard}
                        variant="primary"
                      >
                        Create migration plan
                      </Button>
                    </div>
                  </Tooltip>
                </EmptyState>
              ) : (
                <PlansTable
                  planList={migplans}
                  addPlanDisabledObj={addPlanDisabledObj}
                  toggleAddWizardOpen={toggleWizard}
                />
              )}
              {/* TODO: Placeholder for Plan wizard
              <WizardContainer
                planList={planList}
                VMWareList={VMWareList}
                CNVList={CNVList}
                isEdit={false}
                isOpen={isWizardOpen}
                onHandleWizardModalClose={toggleWizard}
              /> */}
            </CardBody>
          </Card>
        )}
      </PageSection>
    </>
  );
};

export default PlansPage;
