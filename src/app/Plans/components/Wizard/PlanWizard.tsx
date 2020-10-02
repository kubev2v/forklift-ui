import * as React from 'react';
import * as yup from 'yup';
import {
  Breadcrumb,
  BreadcrumbItem,
  Level,
  LevelItem,
  PageSection,
  Title,
  Wizard,
  WizardStepFunctionType,
} from '@patternfly/react-core';
import { Link, useHistory } from 'react-router-dom';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

import WizardStepContainer from './WizardStepContainer';
import GeneralForm from './GeneralForm';
import FilterVMs from './FilterVMsForm';
import SelectVMs from './SelectVMsForm';
import Review from './Review';
import MappingForm from './MappingForm';
import { IOpenShiftProvider, IVMwareProvider, MappingType } from '@app/queries/types';
import { MOCK_VMS } from '@app/queries/mocks/vms.mock';
import { MOCK_STORAGE_MAPPINGS, MOCK_NETWORK_MAPPINGS } from '@app/queries/mocks/mappings.mock';
import { useFormField, useFormState } from '@app/common/hooks/useFormState';

import './PlanWizard.css';

const usePlanWizardFormState = () => ({
  general: useFormState({
    planName: useFormField('', yup.string().label('Plan name').required()),
    planDescription: useFormField('', yup.string().label('Plan description').defined()),
    sourceProvider: useFormField<IVMwareProvider | null>(
      null,
      yup.mixed<IVMwareProvider>().label('Source provider').required()
    ),
    targetProvider: useFormField<IOpenShiftProvider | null>(
      null,
      yup.mixed<IOpenShiftProvider>().label('Target provider').required()
    ),
  }),
  filterVMs: useFormState({}),
});

export type PlanWizardFormState = ReturnType<typeof usePlanWizardFormState>; // ✨ Magic

const PlanWizard: React.FunctionComponent = () => {
  const history = useHistory();
  const forms = usePlanWizardFormState();

  enum StepId {
    General = 1,
    FilterVMs,
    SelectVMs,
    StorageMapping,
    NetworkMapping,
    Hooks,
    Review,
  }

  const [stepIdReached, setStepIdReached] = React.useState(StepId.General);
  const onMove: WizardStepFunctionType = ({ id }) => {
    if (id !== undefined && id > stepIdReached) {
      setStepIdReached(id as StepId);
    }
  };

  const steps = [
    {
      id: StepId.General,
      name: 'General',
      component: (
        <WizardStepContainer title="General Settings">
          <GeneralForm form={forms.general} />
        </WizardStepContainer>
      ),
      enableNext: forms.general.isValid,
    },
    {
      name: 'VM Selection',
      steps: [
        {
          id: StepId.FilterVMs,
          name: 'Filter VMs',
          component: (
            <WizardStepContainer title="Filter VMs">
              <FilterVMs /* TODO pass sourceProvider prop here from form values? */ />
            </WizardStepContainer>
          ),
          enableNext: true,
          canJumpTo: stepIdReached >= StepId.FilterVMs,
        },
        {
          id: StepId.SelectVMs,
          name: 'Select VMs',
          component: (
            <WizardStepContainer title="Select VMs">
              <SelectVMs vms={MOCK_VMS} />
            </WizardStepContainer>
          ),
          enableNext: true,
          canJumpTo: stepIdReached >= StepId.SelectVMs,
        },
      ],
    },
    {
      id: StepId.StorageMapping,
      name: 'Storage Mapping',
      component: (
        <WizardStepContainer title="Map Storage">
          <MappingForm
            key="mapping-form-storage"
            mappingType={MappingType.Storage}
            mappingList={MOCK_STORAGE_MAPPINGS}
          />
        </WizardStepContainer>
      ),
      enableNext: true,
      canJumpTo: stepIdReached >= StepId.StorageMapping,
    },
    {
      id: StepId.NetworkMapping,
      name: 'Network Mapping',
      component: (
        <WizardStepContainer title="Network Mapping">
          <MappingForm
            key="mapping-form-network"
            mappingType={MappingType.Network}
            mappingList={MOCK_NETWORK_MAPPINGS}
          />
        </WizardStepContainer>
      ),
      enableNext: true,
      canJumpTo: stepIdReached >= StepId.NetworkMapping,
    },
    {
      id: StepId.Hooks,
      name: 'Hooks',
      component: (
        <WizardStepContainer title="Hooks">
          <div>TODO: Hooks</div>
        </WizardStepContainer>
      ),
      enableNext: true,
      canJumpTo: stepIdReached >= StepId.Hooks,
    },
    {
      id: StepId.Review,
      name: 'Review',
      component: <Review />,
      nextButtonText: 'Finish',
      canJumpTo: stepIdReached >= StepId.Review,
    },
  ];

  return (
    <>
      <PageSection title="Create a Migration Plan" variant="light">
        <Breadcrumb className={`${spacing.mbLg} ${spacing.prLg}`}>
          <BreadcrumbItem>
            <Link to={`/plans`}>Migration plans</Link>
          </BreadcrumbItem>
          <BreadcrumbItem>Create</BreadcrumbItem>
        </Breadcrumb>
        <Level>
          <LevelItem>
            <Title headingLevel="h1">Create Migration Plan</Title>
          </LevelItem>
        </Level>
      </PageSection>
      <PageSection variant="light" className="plan-wizard-page-section">
        <Wizard
          steps={steps}
          onNext={onMove}
          onBack={onMove}
          onSubmit={(event) => event.preventDefault()}
          onClose={() => history.push('/plans')}
        />
      </PageSection>
    </>
  );
};

export default PlanWizard;
