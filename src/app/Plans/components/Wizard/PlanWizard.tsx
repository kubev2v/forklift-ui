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
import { Link, Prompt, useHistory } from 'react-router-dom';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

import WizardStepContainer from './WizardStepContainer';
import GeneralForm from './GeneralForm';
import FilterVMsForm from './FilterVMsForm';
import SelectVMsForm from './SelectVMsForm';
import Review from './Review';
import MappingForm from './MappingForm';
import {
  ICommonTreeObject,
  IOpenShiftProvider,
  IVMwareProvider,
  Mapping,
  MappingType,
  VMwareTree,
} from '@app/queries/types';
import { MOCK_STORAGE_MAPPINGS, MOCK_NETWORK_MAPPINGS } from '@app/queries/mocks/mappings.mock';
import { useFormField, useFormState } from '@app/common/hooks/useFormState';

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
  filterVMs: useFormState({
    selectedTreeNodes: useFormField<VMwareTree[]>([], yup.array<VMwareTree>().required()),
  }),
  selectVMs: useFormState({
    selectedVMs: useFormField<ICommonTreeObject[]>([], yup.array<ICommonTreeObject>().required()),
  }),
  networkMapping: useFormState({
    mapping: useFormField<Mapping | null>(null, yup.mixed<Mapping>().required()),
    isSaveNewMapping: useFormField(false, yup.boolean().required()),
    newMappingName: useFormField('', yup.string()),
  }),
  storageMapping: useFormState({
    mapping: useFormField<Mapping | null>(null, yup.mixed<Mapping>().required()),
    isSaveNewMapping: useFormField(false, yup.boolean().required()),
    newMappingName: useFormField('', yup.string()),
  }),
});

export type PlanWizardFormState = ReturnType<typeof usePlanWizardFormState>; // ✨ Magic

const PlanWizard: React.FunctionComponent = () => {
  const history = useHistory();
  const forms = usePlanWizardFormState();

  enum StepId {
    General = 1,
    FilterVMs,
    SelectVMs,
    NetworkMapping,
    StorageMapping,
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
              <FilterVMsForm
                form={forms.filterVMs}
                sourceProvider={forms.general.values.sourceProvider}
              />
            </WizardStepContainer>
          ),
          enableNext: forms.filterVMs.isValid,
          canJumpTo: stepIdReached >= StepId.FilterVMs,
        },
        {
          id: StepId.SelectVMs,
          name: 'Select VMs',
          component: (
            <WizardStepContainer title="Select VMs">
              <SelectVMsForm
                form={forms.selectVMs}
                selectedTreeNodes={forms.filterVMs.values.selectedTreeNodes}
                sourceProvider={forms.general.values.sourceProvider}
              />
            </WizardStepContainer>
          ),
          enableNext: forms.selectVMs.isValid,
          canJumpTo: stepIdReached >= StepId.SelectVMs,
        },
      ],
    },
    {
      id: StepId.NetworkMapping,
      name: 'Network Mapping',
      component: (
        <WizardStepContainer title="Network Mapping">
          <MappingForm
            key="mapping-form-network"
            form={forms.networkMapping}
            sourceProvider={forms.general.values.sourceProvider}
            targetProvider={forms.general.values.targetProvider}
            mappingType={MappingType.Network}
            mappingList={MOCK_NETWORK_MAPPINGS}
          />
        </WizardStepContainer>
      ),
      enableNext: forms.networkMapping.isValid,
      canJumpTo: stepIdReached >= StepId.NetworkMapping,
    },
    {
      id: StepId.StorageMapping,
      name: 'Storage Mapping',
      component: (
        <WizardStepContainer title="Map Storage">
          <MappingForm
            key="mapping-form-storage"
            form={forms.storageMapping}
            sourceProvider={forms.general.values.sourceProvider}
            targetProvider={forms.general.values.targetProvider}
            mappingType={MappingType.Storage}
            mappingList={MOCK_STORAGE_MAPPINGS}
          />
        </WizardStepContainer>
      ),
      enableNext: forms.storageMapping.isValid,
      canJumpTo: stepIdReached >= StepId.StorageMapping,
    },
    {
      id: StepId.Review,
      name: 'Review',
      component: (
        <WizardStepContainer title="Review the migration plan">
          <Review forms={forms} />
        </WizardStepContainer>
      ),
      nextButtonText: 'Finish',
      canJumpTo: stepIdReached >= StepId.Review,
    },
  ];

  const isSomeFormDirty = (Object.keys(forms) as (keyof PlanWizardFormState)[]).some(
    (key) => forms[key].isDirty
  );

  return (
    <>
      <Prompt
        when={isSomeFormDirty} // TODO onSave will have to set something to unblock this when the wizard closes after saving
        message="You have unsaved changes, are you sure you want to leave this page?"
      />
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
      <PageSection variant="light" className={spacing.p_0}>
        <Wizard
          className="pf-c-page__main-wizard" // Should be replaced with a prop when supported: https://github.com/patternfly/patternfly-react/issues/4937
          steps={steps}
          onNext={onMove}
          onBack={onMove}
          onSubmit={(event) => event.preventDefault()}
          onSave={() => alert('TODO: create plan CR')}
          onClose={() => history.push('/plans')}
        />
      </PageSection>
    </>
  );
};

export default PlanWizard;
