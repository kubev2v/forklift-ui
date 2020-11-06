import * as React from 'react';
import { TextContent, Text, Grid, GridItem, Form } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { PlanWizardFormState } from './PlanWizard';
import MappingDetailView from '@app/Mappings/components/MappingDetailView';
import { IPlan, Mapping, MappingType } from '@app/queries/types';
import { MutationResult } from 'react-query';
import { IKubeResponse, KubeClientError } from '@app/client/types';
import MutationStatus from '@app/common/components/MutationStatus';
import { generateMappings } from './helpers';

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
  // Reset mutation state on unmount (going back in the wizard clears errors)
  React.useEffect(() => {
    return () => {
      createPlanResult.reset();
      createNetworkMappingResult.reset();
      createStorageMappingResult.reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
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
        <GridItem md={3}>Target namespace</GridItem>
        <GridItem md={9}>{forms.general.values.targetNamespace}</GridItem>
        <GridItem md={3}>Network mapping</GridItem>
        <GridItem md={9}>
          <MappingDetailView mappingType={MappingType.Network} mapping={networkMapping} />
        </GridItem>
        <GridItem md={3}>Storage mapping</GridItem>
        <GridItem md={9}>
          <MappingDetailView mappingType={MappingType.Storage} mapping={storageMapping} />
        </GridItem>
        <GridItem md={3}>Selected VMs</GridItem>
        <GridItem md={9}>{forms.selectVMs.values.selectedVMs.length}</GridItem>
      </Grid>
      <MutationStatus
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
      />
    </Form>
  );
};

export default Review;
