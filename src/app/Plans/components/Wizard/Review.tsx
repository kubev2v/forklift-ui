import * as React from 'react';
import {
  TextContent,
  Text,
  Grid,
  GridItem,
  Form,
  Popover,
  Button,
  List,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import text from '@patternfly/react-styles/css/utilities/Text/text';

import { PlanWizardFormState } from './PlanWizard';
import MappingDetailView from '@app/Mappings/components/MappingDetailView';
import { IPlan, IVMwareVM, Mapping, MappingType, POD_NETWORK } from '@app/queries/types';
import { MutationResult } from 'react-query';
import { IKubeResponse, KubeClientError } from '@app/client/types';
import { QuerySpinnerMode, ResolvedQueries } from '@app/common/components/ResolvedQuery';
import { generateMappings } from './helpers';
import { usePausedPollingEffect } from '@app/common/context';
import { useNamespacesQuery } from '@app/queries/namespaces';

interface IReviewProps {
  forms: PlanWizardFormState;
  allMutationResults: (
    | MutationResult<IKubeResponse<IPlan>, KubeClientError>
    | MutationResult<IKubeResponse<Mapping>, KubeClientError>
  )[];
  allMutationErrorTitles: string[];
  planBeingEdited: IPlan | null;
  selectedVMs: IVMwareVM[];
}

const Review: React.FunctionComponent<IReviewProps> = ({
  forms,
  allMutationResults,
  allMutationErrorTitles,
  planBeingEdited,
  selectedVMs,
}: IReviewProps) => {
  usePausedPollingEffect();

  const { networkMapping, storageMapping } = generateMappings({ forms });

  const namespacesQuery = useNamespacesQuery(forms.general.values.targetProvider);
  const namespaceOptions = namespacesQuery.data?.map((namespace) => namespace.name) || [];
  const isNewNamespace = !namespaceOptions.find(
    (namespace) => namespace === forms.general.values.targetNamespace
  );

  return (
    <Form>
      <TextContent>
        <Text component="p">
          Review the information below and click Finish to {!planBeingEdited ? 'create' : 'save'}{' '}
          your migration plan. Use the Back button to make changes.
        </Text>
      </TextContent>
      <Grid hasGutter className={`${spacing.mtSm} ${spacing.mbMd}`}>
        <GridItem md={12}></GridItem>
        <GridItem md={3}>Plan name</GridItem>
        <GridItem md={9} id="review-plan-name">
          {forms.general.values.planName}
        </GridItem>
        {forms.general.values.planDescription ? (
          <>
            <GridItem md={3} id="plan-description-label">
              Plan description
            </GridItem>
            <GridItem md={9} id="review-plan-description" aria-labelledby="plan-description-label">
              {forms.general.values.planDescription}
            </GridItem>
          </>
        ) : null}
        <GridItem md={3} id="source-provider-label">
          Source provider
        </GridItem>
        <GridItem md={9} id="review-source-provider" aria-labelledby="source-provider-label">
          {forms.general.values.sourceProvider?.name}
        </GridItem>
        <GridItem md={3} id="target-provider-label">
          Target provider
        </GridItem>
        <GridItem md={9} id="review-target-provider" aria-labelledby="target-provider-label">
          {forms.general.values.targetProvider?.name}
        </GridItem>
        <GridItem md={3} id="target-namespace-label">
          Target namespace
        </GridItem>
        <GridItem md={9}>
          <span id="review-target-namespace" aria-labelledby="target-namespace-label">
            {forms.general.values.targetNamespace}
          </span>
          {isNewNamespace ? (
            <TextContent>
              <Text component="small" id="review-new-target-namespace-message">
                This is a new namespace that will be created when the plan is started.
              </Text>
            </TextContent>
          ) : null}
        </GridItem>
        <GridItem md={3} id="transfer-network-label">
          Migration transfer network
        </GridItem>
        <GridItem md={9} id="review-transfer-network" aria-labelledby="transfer-network-label">
          {forms.general.values.migrationNetwork || POD_NETWORK.name}
        </GridItem>
        <GridItem md={3}>Selected VMs</GridItem>
        <GridItem md={9}>
          <Popover
            headerContent={<div>Selected VMs</div>}
            bodyContent={
              <List id="review-selected-vms-list">
                {selectedVMs.map((vm, index) => (
                  <li key={index}>{vm.name}</li>
                ))}
              </List>
            }
          >
            <Button variant="link" isInline id="review-selected-vms-count">
              {selectedVMs.length}
            </Button>
          </Popover>
        </GridItem>
        <GridItem md={3} id="network-mapping-label">
          Network mapping
        </GridItem>
        <GridItem md={9} id="review-network-mapping" aria-labelledby="network-mapping-label">
          <MappingDetailView mappingType={MappingType.Network} mapping={networkMapping} />
        </GridItem>
        <GridItem md={3} id="storage-mapping-label">
          Storage mapping
        </GridItem>
        <GridItem md={9} id="review-storage-mapping" aria-labelledby="storage-mapping-label">
          <MappingDetailView mappingType={MappingType.Storage} mapping={storageMapping} />
        </GridItem>
        <GridItem md={3} id="migration-type-label">
          Migration type
        </GridItem>
        <GridItem md={9} id="review-migration-type" aria-labelledby="migration-type-label">
          {forms.type.values.type}
        </GridItem>
        {forms.hooks.values.instances ? (
          <>
            <GridItem md={3} id="migration-type-label">
              Hooks
            </GridItem>
            <GridItem md={9} id="review-plan-hooks" aria-labelledby="migration-hooks-label">
              <div>
                <Grid>
                  <GridItem span={5} id="migration-plan-hooks-definition-label">
                    <Text className={text.fontWeightBold}>Definition</Text>
                    {forms.hooks.values.instances?.map((hook) => (
                      <Text key={Math.random()}>
                        {hook.type === 'playbook' ? 'Ansible playbook' : 'Custom container image'}
                      </Text>
                    ))}
                  </GridItem>
                  <GridItem span={2} className="migration-hooks-align" />
                  <GridItem span={5} id="migration-plan-hooks-steps-label">
                    <Text className={text.fontWeightBold}>Migration step</Text>
                    {forms.hooks.values.instances?.map((hook) => (
                      <Text key={Math.random()}>
                        {hook.step === 'PreHook' ? 'Pre-migration' : 'Post-migration'}
                      </Text>
                    ))}
                  </GridItem>
                </Grid>
              </div>
            </GridItem>
          </>
        ) : null}
      </Grid>
      <ResolvedQueries
        results={allMutationResults}
        errorTitles={allMutationErrorTitles}
        spinnerMode={QuerySpinnerMode.Inline}
      />
    </Form>
  );
};

export default Review;
