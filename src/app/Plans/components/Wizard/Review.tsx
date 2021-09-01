import * as React from 'react';
import { TextContent, Text, Form } from '@patternfly/react-core';

import { PlanWizardFormState } from './PlanWizard';
import { IPlan, SourceVM } from '@app/queries/types';
import { QuerySpinnerMode, ResolvedQueries } from '@app/common/components/ResolvedQuery';
import { generateMappings, generatePlan } from './helpers';
import { usePausedPollingEffect } from '@app/common/context';
import { useNamespacesQuery } from '@app/queries';
import PlanDetails from '../PlanDetails';
import { UnknownResult } from '@app/common/types';

interface IReviewProps {
  forms: PlanWizardFormState;
  allMutationResults: UnknownResult[];
  allMutationErrorTitles: string[];
  planBeingPrefilled: IPlan | null;
  selectedVMs: SourceVM[];
}

const Review: React.FunctionComponent<IReviewProps> = ({
  forms,
  allMutationResults,
  allMutationErrorTitles,
  planBeingPrefilled,
  selectedVMs,
}: IReviewProps) => {
  usePausedPollingEffect();

  // Create non resilient mappings and plan to display details before commit (or not)
  const { networkMapping, storageMapping } = generateMappings({ forms });
  const plan: IPlan = generatePlan(
    forms,
    { name: '', namespace: '' },
    { name: '', namespace: '' },
    []
  );

  const namespacesQuery = useNamespacesQuery(forms.general.values.targetProvider);
  const namespaceOptions = namespacesQuery.data?.map((namespace) => namespace.name) || [];

  const isNewNamespace = !namespaceOptions.find(
    (namespace) => namespace === forms.general.values.targetNamespace
  );
  return (
    <Form>
      <TextContent>
        <Text component="p">
          Review the information below and click Finish to {!planBeingPrefilled ? 'create' : 'save'}{' '}
          your migration plan. Use the Back button to make changes.
        </Text>
      </TextContent>
      <PlanDetails
        plan={plan}
        sourceProvider={forms.general.values.sourceProvider}
        isNewNamespace={isNewNamespace}
        networkMapping={networkMapping}
        storageMapping={storageMapping}
        vms={selectedVMs}
        hooksDetails={
          forms.hooks?.values.instances.map((hook) => ({
            step: hook.step,
            playbook: hook.type === 'playbook' ? true : false,
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
