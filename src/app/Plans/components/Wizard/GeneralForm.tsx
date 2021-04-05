import * as React from 'react';
import { Form, TextArea, Title } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { ValidatedTextInput } from '@konveyor/lib-ui';

import { IPlan } from '@app/queries/types';
import { useClusterProvidersQuery, useInventoryProvidersQuery } from '@app/queries';
import { PlanWizardFormState } from './PlanWizard';
import { ResolvedQueries } from '@app/common/components/ResolvedQuery';
import ProviderSelect from '@app/common/components/ProviderSelect';
import { ProviderType } from '@app/common/constants';
import { usePausedPollingEffect } from '@app/common/context';
import TargetNamespaceAndNetworkSelect from './TargetNamespaceAndNetworkSelect';

interface IGeneralFormProps {
  form: PlanWizardFormState['general'];
  planBeingEdited: IPlan | null;
}

const GeneralForm: React.FunctionComponent<IGeneralFormProps> = ({
  form,
  planBeingEdited,
}: IGeneralFormProps) => {
  usePausedPollingEffect();

  const inventoryProvidersQuery = useInventoryProvidersQuery();
  const clusterProvidersQuery = useClusterProvidersQuery();

  return (
    <ResolvedQueries
      results={[inventoryProvidersQuery, clusterProvidersQuery]}
      errorTitles={[
        'Error loading provider inventory data',
        'Error loading providers from cluster',
      ]}
    >
      <Form className={spacing.pbXl}>
        <Title headingLevel="h2" size="md">
          Give your plan a name and a description
        </Title>
        <ValidatedTextInput
          field={form.fields.planName}
          label="Plan name"
          isRequired
          fieldId="plan-name"
          inputProps={{ isDisabled: !!planBeingEdited }}
        />
        <ValidatedTextInput
          component={TextArea}
          field={form.fields.planDescription}
          label="Plan description"
          fieldId="plan-description"
        />
        <Title headingLevel="h3" size="md">
          Select source and target providers
        </Title>
        <ProviderSelect
          label="Source provider"
          providerType={ProviderType.vsphere}
          field={form.fields.sourceProvider}
        />
        <ProviderSelect
          label="Target provider"
          providerType={ProviderType.openshift}
          field={form.fields.targetProvider}
        />
        <TargetNamespaceAndNetworkSelect form={form} />
      </Form>
    </ResolvedQueries>
  );
};

export default GeneralForm;
