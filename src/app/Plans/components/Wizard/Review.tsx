import * as React from 'react';
import { TextContent, Text, Form } from '@patternfly/react-core';

import { PlanWizardFormState } from './PlanWizard';
import { IPlan, IVMwareVM, Mapping, POD_NETWORK } from '@app/queries/types';
import { MutationResult } from 'react-query';
import { IKubeResponse, KubeClientError } from '@app/client/types';
import { QuerySpinnerMode, ResolvedQueries } from '@app/common/components/ResolvedQuery';
import { generateMappings } from './helpers';
import { usePausedPollingEffect } from '@app/common/context';
import { useNamespacesQuery } from '@app/queries/namespaces';
import PlanDetails from '../PlanDetails';

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
      <PlanDetails
        planName={forms.general.values.planName}
        description={forms.general.values.planDescription}
        sourceName={forms.general.values.sourceProvider?.name || ''}
        destinationName={forms.general.values.targetProvider?.name || ''}
        targetNamespace={forms.general.values.targetNamespace}
        isNewNamespace={isNewNamespace}
        planType={forms.type.values.type === 'Warm' ? true : false}
        transferNetwork={forms.general.values.migrationNetwork || POD_NETWORK.name}
        planVMs={selectedVMs}
        networkMapping={networkMapping}
        storageMapping={storageMapping}
        vms={selectedVMs}
        hooksDetails={
          forms.hooks?.values.instances.map((hook) => ({
            type: hook.type,
            step: hook.step,
          })) || null
        }
      />
      <ResolvedQueries
        results={allMutationResults}
        errorTitles={allMutationErrorTitles}
        spinnerMode={QuerySpinnerMode.Inline}
      />
    </Form>
  );
};

export default Review;
