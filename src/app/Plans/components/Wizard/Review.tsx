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
import { PlanWizardFormState } from './PlanWizard';
import MappingDetailView from '@app/Mappings/components/MappingDetailView';
import { IPlan, Mapping, MappingType } from '@app/queries/types';
import { MutationResult } from 'react-query';
import { IKubeResponse, KubeClientError } from '@app/client/types';
import { QuerySpinnerMode, ResolvedQueries } from '@app/common/components/ResolvedQuery';
import { generateMappings } from './helpers';
import { usePausedPollingEffect } from '@app/common/context';

interface IReviewProps {
  forms: PlanWizardFormState;
  createPlanResult: MutationResult<IKubeResponse<IPlan>, KubeClientError>;
  patchPlanResult: MutationResult<IKubeResponse<IPlan>, KubeClientError>;
  createNetworkMappingResult: MutationResult<IKubeResponse<Mapping>, KubeClientError>;
  createStorageMappingResult: MutationResult<IKubeResponse<Mapping>, KubeClientError>;
  planBeingEdited: IPlan | null;
}

const Review: React.FunctionComponent<IReviewProps> = ({
  forms,
  createPlanResult,
  patchPlanResult,
  createNetworkMappingResult,
  createStorageMappingResult,
  planBeingEdited,
}: IReviewProps) => {
  usePausedPollingEffect();

  const { networkMapping, storageMapping } = generateMappings(forms);
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
        <GridItem md={9}>{forms.general.values.planName}</GridItem>
        {forms.general.values.planDescription ? (
          <>
            <GridItem md={3}>Plan description</GridItem>
            <GridItem md={9}>{forms.general.values.planDescription}</GridItem>
          </>
        ) : null}
        <GridItem md={3}>Source provider</GridItem>
        <GridItem md={9}>{forms.general.values.sourceProvider?.name}</GridItem>
        <GridItem md={3}>Target provider</GridItem>
        <GridItem md={9}>{forms.general.values.targetProvider?.name}</GridItem>
        <GridItem md={3}>Target namespace</GridItem>
        <GridItem md={9}>{forms.general.values.targetNamespace}</GridItem>
        <GridItem md={3}>Selected VMs</GridItem>
        <GridItem md={9}>
          <Popover
            headerContent={<div>Selected VMs</div>}
            bodyContent={
              <List>
                {forms.selectVMs.values.selectedVMs.map((vm, index) => (
                  <li key={index}>{vm.name}</li>
                ))}
              </List>
            }
          >
            <Button variant="link" isInline>
              {forms.selectVMs.values.selectedVMs.length}
            </Button>
          </Popover>
        </GridItem>
        <GridItem md={3}>Network mapping</GridItem>
        <GridItem md={9}>
          <MappingDetailView mappingType={MappingType.Network} mapping={networkMapping} />
        </GridItem>
        <GridItem md={3}>Storage mapping</GridItem>
        <GridItem md={9}>
          <MappingDetailView mappingType={MappingType.Storage} mapping={storageMapping} />
        </GridItem>
      </Grid>
      <ResolvedQueries
        results={[
          !planBeingEdited ? createPlanResult : patchPlanResult,
          createNetworkMappingResult,
          createStorageMappingResult,
        ]}
        errorTitles={[
          `Error ${!planBeingEdited ? 'creating' : 'patching'} migration plan`,
          'Error creating network mapping',
          'Error creating storage mapping',
        ]}
        spinnerMode={QuerySpinnerMode.Inline}
      />
    </Form>
  );
};

export default Review;
