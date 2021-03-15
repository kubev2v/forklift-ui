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
import { Link, Prompt, Redirect, useHistory, useRouteMatch } from 'react-router-dom';
import { QueryResult, QueryStatus } from 'react-query';
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
  IPlan,
  IVMwareProvider,
  IVMwareVM,
  Mapping,
  MappingType,
  VMwareTree,
  VMwareTreeType,
} from '@app/queries/types';
import {
  IMappingBuilderItem,
  mappingBuilderItemsSchema,
} from '@app/Mappings/components/MappingBuilder';
import { generateMappings, generatePlan, useEditingPlanPrefillEffect } from './helpers';
import {
  getMappingNameSchema,
  useMappingsQuery,
  getPlanNameSchema,
  useCreatePlanMutation,
  usePatchPlanMutation,
  usePlansQuery,
  useCreateMappingMutations,
  usePatchMappingMutations,
} from '@app/queries';
import { getAggregateQueryStatus, nameAndNamespace } from '@app/queries/helpers';
import { dnsLabelNameSchema } from '@app/common/constants';
import { IKubeList } from '@app/client/types';
import LoadingEmptyState from '@app/common/components/LoadingEmptyState';
import { ResolvedQueries } from '@app/common/components/ResolvedQuery';

const useMappingFormState = (mappingsQuery: QueryResult<IKubeList<Mapping>>) => {
  const isSaveNewMapping = useFormField(false, yup.boolean().required());
  const newMappingNameSchema = getMappingNameSchema(mappingsQuery, null).label('Name');
  return useFormState({
    isCreateMappingSelected: useFormField(false, yup.boolean().required()),
    selectedExistingMapping: useFormField<Mapping | null>(null, yup.mixed<Mapping>()),
    builderItems: useFormField<IMappingBuilderItem[]>([], mappingBuilderItemsSchema),
    isSaveNewMapping,
    newMappingName: useFormField(
      '',
      isSaveNewMapping.value ? newMappingNameSchema.required() : yup.string()
    ),
    isPrefilled: useFormField(false, yup.boolean()),
  });
};

const usePlanWizardFormState = (
  plansQuery: QueryResult<IKubeList<IPlan>>,
  networkMappingsQuery: QueryResult<IKubeList<Mapping>>,
  storageMappingsQuery: QueryResult<IKubeList<Mapping>>,
  planBeingEdited: IPlan | null
) => {
  const forms = {
    general: useFormState({
      planName: useFormField(
        '',
        getPlanNameSchema(plansQuery, planBeingEdited).label('Plan name').required()
      ),
      planDescription: useFormField('', yup.string().label('Plan description').defined()),
      sourceProvider: useFormField<IVMwareProvider | null>(
        null,
        yup.mixed<IVMwareProvider>().label('Source provider').required()
      ),
      targetProvider: useFormField<IOpenShiftProvider | null>(
        null,
        yup.mixed<IOpenShiftProvider>().label('Target provider').required()
      ),
      targetNamespace: useFormField('', dnsLabelNameSchema.label('Target namespace').required()),
      migrationNetwork: useFormField<string | null>(
        null,
        yup.mixed<string>().label('Migration network')
      ),
    }),
    filterVMs: useFormState({
      treeType: useFormField<VMwareTreeType>(VMwareTreeType.Host, yup.mixed<VMwareTreeType>()),
      selectedTreeNodes: useFormField<VMwareTree[]>([], yup.array<VMwareTree>().required()),
      isPrefilled: useFormField(false, yup.boolean()),
    }),
    selectVMs: useFormState({
      selectedVMs: useFormField<IVMwareVM[]>([], yup.array<IVMwareVM>().required()),
    }),
    networkMapping: useMappingFormState(networkMappingsQuery),
    storageMapping: useMappingFormState(storageMappingsQuery),
  };

  return {
    ...forms,
    isSomeFormDirty: (Object.keys(forms) as (keyof typeof forms)[]).some(
      (key) => forms[key].isDirty
    ),
  };
};

export type PlanWizardFormState = ReturnType<typeof usePlanWizardFormState>; // ✨ Magic

const PlanWizard: React.FunctionComponent = () => {
  const history = useHistory();
  const plansQuery = usePlansQuery();
  const networkMappingsQuery = useMappingsQuery(MappingType.Network);
  const storageMappingsQuery = useMappingsQuery(MappingType.Storage);

  const editRouteMatch = useRouteMatch<{ planName: string }>({
    path: '/plans/:planName/edit',
    strict: true,
    sensitive: true,
  });
  const planBeingEdited =
    plansQuery.data?.items.find((plan) => plan.metadata.name === editRouteMatch?.params.planName) ||
    null;

  const forms = usePlanWizardFormState(
    plansQuery,
    networkMappingsQuery,
    storageMappingsQuery,
    planBeingEdited
  );

  const { isDonePrefilling, prefillQueries, prefillErrorTitles } = useEditingPlanPrefillEffect(
    forms,
    planBeingEdited,
    !!editRouteMatch
  );

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

  // When providers change, reset all other forms
  React.useEffect(() => {
    if (!isFirstRender.current && isDonePrefilling) {
      forms.filterVMs.reset();
      forms.selectVMs.reset();
      forms.networkMapping.reset();
      forms.storageMapping.reset();
    }
    isFirstRender.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forms.general.values.sourceProvider, forms.general.values.targetProvider]);

  const onClose = () => history.push('/plans');

  const [createPlan, createPlanResult] = useCreatePlanMutation();
  const [patchPlan, patchPlanResult] = usePatchPlanMutation();

  const {
    network: [createOwnedNetworkMap, createOwnedNetworkMapResult],
    storage: [createOwnedStorageMap, createOwnedStorageMapResult],
  } = useCreateMappingMutations();
  const {
    network: [createSharedNetworkMap, createSharedNetworkMapResult],
    storage: [createSharedStorageMap, createSharedStorageMapResult],
  } = useCreateMappingMutations();
  const {
    network: [patchNetworkMap, patchNetworkMapResult],
    storage: [patchStorageMap, patchStorageMapResult],
  } = usePatchMappingMutations();

  // TODO should the create+create+patch logic be in the query file instead?
  const createPlanAndOwnedMappings = async () => {
    // Create mappings with generated names and collect refs to them
    const { networkMapping, storageMapping } = generateMappings({
      forms,
      generateName: `${forms.general.values.planName}-`,
    });
    const [networkMappingRef, storageMappingRef] = (
      await Promise.all([
        networkMapping && createOwnedNetworkMap(networkMapping),
        storageMapping && createOwnedStorageMap(storageMapping),
      ])
    ).map((response) => nameAndNamespace(response?.data.metadata));

    // Create plan referencing new mappings
    const planResponse = await createPlan(
      generatePlan(forms, networkMappingRef, storageMappingRef)
    );

    // Patch mappings with ownerReferences to new plan
    const {
      networkMapping: networkMapWithOwnerRef,
      storageMapping: storageMapWithOwnerRef,
    } = generateMappings({
      forms,
      owner: planResponse?.data,
    });
    if (networkMapWithOwnerRef && storageMapWithOwnerRef) {
      await Promise.all([
        patchNetworkMap(networkMapWithOwnerRef),
        patchStorageMap(storageMapWithOwnerRef),
      ]);
    }
  };

  const patchPlanAndOwnedMappings = () => {
    if (!planBeingEdited) return;
    const { networkMapping, storageMapping } = generateMappings({
      forms,
      owner: planBeingEdited,
    });
    networkMapping && patchNetworkMap(networkMapping);
    storageMapping && patchStorageMap(storageMapping);
    const { network: networkMappingRef, storage: storageMappingRef } = planBeingEdited.spec.map;
    patchPlan(generatePlan(forms, networkMappingRef, storageMappingRef));
  };

  const createSharedMappings = async () => {
    const { networkMapping, storageMapping } = generateMappings({ forms });
    if (networkMapping && forms.networkMapping.values.isSaveNewMapping) {
      createSharedNetworkMap(networkMapping);
    }
    if (storageMapping && forms.storageMapping.values.isSaveNewMapping) {
      createSharedStorageMap(storageMapping);
    }
  };

  const onSave = () => {
    if (!planBeingEdited) {
      createPlanAndOwnedMappings();
    } else {
      patchPlanAndOwnedMappings();
    }
    createSharedMappings();
  };

  const allMutationResults = [
    ...(!editRouteMatch
      ? [createPlanResult, createOwnedNetworkMapResult, createOwnedStorageMapResult]
      : [patchPlanResult]),
    patchNetworkMapResult,
    patchStorageMapResult,
    ...(forms.networkMapping.values.isSaveNewMapping ? [createSharedNetworkMapResult] : []),
    ...(forms.storageMapping.values.isSaveNewMapping ? [createSharedStorageMapResult] : []),
  ];
  const allMutationErrorTitles = [
    ...(!editRouteMatch
      ? [
          'Error creating migration plan',
          'Error creating network mapping',
          'Error creating storage mapping',
        ]
      : ['Error saving migration plan']),
    'Error saving network mapping',
    'Error saving storage mapping',
    ...(forms.networkMapping.values.isSaveNewMapping ? ['Error creating network mapping'] : []),
    ...(forms.storageMapping.values.isSaveNewMapping ? ['Error creating storage mapping'] : []),
  ];
  const mutationStatus = getAggregateQueryStatus(allMutationResults);

  React.useEffect(() => {
    if (mutationStatus === QueryStatus.Success) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mutationStatus]);

  const steps = [
    {
      id: StepId.General,
      name: 'General',
      component: (
        <WizardStepContainer title="General settings">
          <GeneralForm form={forms.general} planBeingEdited={planBeingEdited} />
        </WizardStepContainer>
      ),
      enableNext: forms.general.isValid,
    },
    {
      name: 'VM selection',
      steps: [
        {
          id: StepId.FilterVMs,
          name: 'Filter VMs',
          component: (
            <WizardStepContainer title="Filter VMs">
              <FilterVMsForm
                form={forms.filterVMs}
                sourceProvider={forms.general.values.sourceProvider}
                planBeingEdited={planBeingEdited}
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
      name: 'Network mapping',
      component: (
        <WizardStepContainer title="Network mapping">
          <MappingForm
            key="mapping-form-network"
            form={forms.networkMapping}
            sourceProvider={forms.general.values.sourceProvider}
            targetProvider={forms.general.values.targetProvider}
            mappingType={MappingType.Network}
            selectedVMs={forms.selectVMs.values.selectedVMs}
            planBeingEdited={planBeingEdited}
          />
        </WizardStepContainer>
      ),
      enableNext: forms.networkMapping.isValid,
      canJumpTo: stepIdReached >= StepId.NetworkMapping,
    },
    {
      id: StepId.StorageMapping,
      name: 'Storage mapping',
      component: (
        <WizardStepContainer title="Storage mapping">
          <MappingForm
            key="mapping-form-storage"
            form={forms.storageMapping}
            sourceProvider={forms.general.values.sourceProvider}
            targetProvider={forms.general.values.targetProvider}
            mappingType={MappingType.Storage}
            selectedVMs={forms.selectVMs.values.selectedVMs}
            planBeingEdited={planBeingEdited}
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
          <Review
            forms={forms}
            allMutationResults={allMutationResults}
            allMutationErrorTitles={allMutationErrorTitles}
            planBeingEdited={planBeingEdited}
          />
        </WizardStepContainer>
      ),
      enableNext: mutationStatus === QueryStatus.Idle,
      nextButtonText: 'Finish',
      canJumpTo: stepIdReached >= StepId.Review,
    },
  ];

  const resetResultsOnNav: WizardStepFunctionType = (_newStep, prevStep) => {
    if (prevStep.prevId === StepId.Review) {
      allMutationResults.forEach((result) => result.reset());
    }
  };

  return (
    <ResolvedQueries
      results={[plansQuery, networkMappingsQuery, storageMappingsQuery, ...prefillQueries]}
      errorTitles={[
        'Error loading plans',
        'Error loading network mappings',
        'Error loading storage mappings',
        ...prefillErrorTitles,
      ]}
      errorsInline={false}
      className={spacing.mMd}
    >
      {!isDonePrefilling ? (
        <LoadingEmptyState />
      ) : editRouteMatch && (!planBeingEdited || planBeingEdited?.status?.migration?.started) ? (
        <Redirect to="/plans" />
      ) : (
        <>
          <Prompt
            when={forms.isSomeFormDirty && mutationStatus === QueryStatus.Idle}
            message="You have unsaved changes, are you sure you want to leave this page?"
          />
          <PageSection
            title={`${!planBeingEdited ? 'Create' : 'Edit'} Migration Plan`}
            variant="light"
          >
            <Breadcrumb className={`${spacing.mbLg} ${spacing.prLg}`}>
              <BreadcrumbItem>
                <Link to={`/plans`}>Migration plans</Link>
              </BreadcrumbItem>
              {planBeingEdited ? (
                <BreadcrumbItem>{planBeingEdited.metadata.name}</BreadcrumbItem>
              ) : null}
              <BreadcrumbItem>{!planBeingEdited ? 'Create' : 'Edit'}</BreadcrumbItem>
            </Breadcrumb>
            <Level>
              <LevelItem>
                <Title headingLevel="h1">
                  {!planBeingEdited ? 'Create' : 'Edit'} migration plan
                </Title>
              </LevelItem>
            </Level>
          </PageSection>
          <PageSection variant="light" className={spacing.p_0}>
            <Wizard
              className="pf-c-page__main-wizard" // Should be replaced with a prop when supported: https://github.com/patternfly/patternfly-react/issues/4937
              steps={steps}
              onSubmit={(event) => event.preventDefault()}
              onSave={onSave}
              onClose={onClose}
              onBack={resetResultsOnNav}
              onGoToStep={resetResultsOnNav}
            />
          </PageSection>
        </>
      )}
    </ResolvedQueries>
  );
};

export default PlanWizard;
