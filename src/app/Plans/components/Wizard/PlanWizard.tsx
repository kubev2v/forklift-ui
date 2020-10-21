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
} from '@patternfly/react-core';
import { Link, Prompt, useHistory } from 'react-router-dom';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { useFormField, useFormState } from '@konveyor/lib-ui';

import WizardStepContainer from './WizardStepContainer';
import GeneralForm from './GeneralForm';
import FilterVMsForm from './FilterVMsForm';
import SelectVMsForm from './SelectVMsForm';
import Review from './Review';
import MappingForm from './MappingForm';
import {
  IOpenShiftProvider,
  IVMwareProvider,
  IVMwareVM,
  Mapping,
  MappingType,
  VMwareTree,
  VMwareTreeType,
} from '@app/queries/types';
import { usePausedPollingEffect } from '@app/common/context';
import {
  IMappingBuilderItem,
  mappingBuilderItemsSchema,
} from '@app/Mappings/components/MappingBuilder';
import { generateMappings } from './helpers';

const useMappingFormState = () => {
  const isSaveNewMapping = useFormField(false, yup.boolean().required());
  const newMappingNameSchema = yup.string().label('Name');
  return useFormState({
    isCreateMappingSelected: useFormField(false, yup.boolean().required()),
    selectedExistingMapping: useFormField<Mapping | null>(null, yup.mixed<Mapping>()),
    builderItems: useFormField<IMappingBuilderItem[]>([], mappingBuilderItemsSchema),
    isSaveNewMapping,
    newMappingName: useFormField(
      '',
      isSaveNewMapping.value ? newMappingNameSchema.required() : newMappingNameSchema
    ),
  });
};

// TODO add support for prefilling forms for editing an API plan
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
    targetNamespace: useFormField('', yup.string().label('Target namespace').required()),
  }),
  filterVMs: useFormState({
    treeType: useFormField<VMwareTreeType>(VMwareTreeType.Host, yup.mixed<VMwareTreeType>()),
    selectedTreeNodes: useFormField<VMwareTree[]>([], yup.array<VMwareTree>().required()),
  }),
  selectVMs: useFormState({
    selectedVMs: useFormField<IVMwareVM[]>([], yup.array<IVMwareVM>().required()),
  }),
  networkMapping: useMappingFormState(),
  storageMapping: useMappingFormState(),
});

export type PlanWizardFormState = ReturnType<typeof usePlanWizardFormState>; // ✨ Magic

const PlanWizard: React.FunctionComponent = () => {
  usePausedPollingEffect(); // Polling can interfere with form state
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

  let stepIdReached = StepId.General;
  if (forms.general.isValid) stepIdReached = StepId.FilterVMs;
  if (forms.filterVMs.isValid) stepIdReached = StepId.SelectVMs;
  if (forms.selectVMs.isValid) stepIdReached = StepId.NetworkMapping;
  if (forms.networkMapping.isValid) stepIdReached = StepId.StorageMapping;
  if (forms.storageMapping.isValid) stepIdReached = StepId.Review;

  const isFirstRender = React.useRef(true);

  /* eslint-disable react-hooks/exhaustive-deps */

  // When providers change, reset dependent forms (filter selections)
  React.useEffect(() => {
    if (!isFirstRender.current) {
      forms.filterVMs.reset();
    }
    isFirstRender.current = false;
  }, [forms.general.values.sourceProvider, forms.general.values.targetProvider]);

  // When filter selections change, reset dependent forms (VM selections)
  React.useEffect(() => {
    if (!isFirstRender.current) {
      forms.selectVMs.reset();
    }
    isFirstRender.current = false;
  }, [forms.filterVMs.values.selectedTreeNodes]);

  // When VM selections change, reset dependent forms (mappings)
  React.useEffect(() => {
    if (!isFirstRender.current) {
      forms.networkMapping.reset();
      forms.storageMapping.reset();
    }
    isFirstRender.current = false;
  }, [forms.selectVMs.values.selectedVMs]);

  /* eslint-enable react-hooks/exhaustive-deps */

  const { networkMapping, storageMapping } = generateMappings(forms);

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
            selectedVMs={forms.selectVMs.values.selectedVMs}
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
            selectedVMs={forms.selectVMs.values.selectedVMs}
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
          <Review forms={forms} networkMapping={networkMapping} storageMapping={storageMapping} />
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
          onSubmit={(event) => event.preventDefault()}
          onSave={() => alert('TODO: create plan CR')}
          onClose={() => history.push('/plans')}
        />
      </PageSection>
    </>
  );
};

export default PlanWizard;
