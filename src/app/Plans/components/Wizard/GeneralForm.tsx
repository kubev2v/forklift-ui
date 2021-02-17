import * as React from 'react';
import {
  Form,
  FormGroup,
  Select,
  SelectGroup,
  SelectOption,
  TextArea,
  Title,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { getFormGroupProps, ValidatedTextInput } from '@konveyor/lib-ui';

import { IPlan } from '@app/queries/types';
import { useClusterProvidersQuery, useInventoryProvidersQuery } from '@app/queries';
import { PlanWizardFormState } from './PlanWizard';
import { useNamespacesQuery } from '@app/queries/namespaces';
import {
  QuerySpinnerMode,
  ResolvedQueries,
  ResolvedQuery,
} from '@app/common/components/ResolvedQuery';
import ProviderSelect from '@app/common/components/ProviderSelect';
import { ProviderType } from '@app/common/constants';
import { usePausedPollingEffect } from '@app/common/context';
import './GeneralForm.css';

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
  const namespacesQuery = useNamespacesQuery(form.values.targetProvider);

  const [isNamespaceSelectOpen, setIsNamespaceSelectOpen] = React.useState(false);

  const getFilteredOptions = (searchText?: string) => {
    const namespaceOptions = namespacesQuery.data?.map((namespace) => namespace.name) || [];
    const filteredNamespaces = !searchText
      ? namespaceOptions
      : namespaceOptions.filter((option) => !!option.toLowerCase().match(searchText.toLowerCase()));
    return [
      <SelectGroup key="group" label="Select or type to create a namespace">
        {filteredNamespaces.map((option) => {
          let renderedOption: (string | React.ReactNode)[] = [option];
          if (searchText) {
            const fragments = option.split(searchText);
            renderedOption = option.split(searchText).flatMap((fragment, index) =>
              index === fragments.length - 1
                ? [fragment]
                : [
                    fragment,
                    <span className="highlight-match" key={index}>
                      {searchText}
                    </span>,
                  ]
            );
          }
          return (
            <SelectOption key={option} value={option}>
              {renderedOption}
            </SelectOption>
          );
        })}
      </SelectGroup>,
    ];
  };

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
        <FormGroup
          label="Target namespace"
          isRequired
          fieldId="target-namespace"
          {...getFormGroupProps(form.fields.targetNamespace)}
        >
          <ResolvedQuery
            result={namespacesQuery}
            errorTitle="Error loading namespaces"
            spinnerProps={{ className: spacing.mXs }}
            spinnerMode={QuerySpinnerMode.Inline}
          >
            <Select
              placeholderText="Select a namespace"
              isOpen={isNamespaceSelectOpen}
              onToggle={setIsNamespaceSelectOpen}
              onSelect={(_event, selection) => {
                form.fields.targetNamespace.setValue(selection as string);
                setIsNamespaceSelectOpen(false);
              }}
              onFilter={(event) => getFilteredOptions(event.target.value)}
              selections={form.values.targetNamespace}
              variant="typeahead"
              isCreatable
              isGrouped
              id="target-namespace"
              aria-label="Target namespace"
              isDisabled={!form.values.targetProvider}
            >
              {getFilteredOptions()}
            </Select>
          </ResolvedQuery>
        </FormGroup>
      </Form>
    </ResolvedQueries>
  );
};

export default GeneralForm;
