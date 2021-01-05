import { useInventoryProvidersQuery } from '@app/queries';
import { InventoryProvider } from '@app/queries/types';
import { getFormGroupProps, IValidatedFormField } from '@konveyor/lib-ui';
import { FormGroup } from '@patternfly/react-core';
import * as React from 'react';
import { ProviderType } from '../constants';
import { ResolvedQuery } from './ResolvedQuery';
import SimpleSelect, { OptionWithValue } from './SimpleSelect';

interface IProviderSelectProps<T extends InventoryProvider> {
  label: string;
  providerType: ProviderType;
  field: IValidatedFormField<T | null>;
}

const ProviderSelect = <T extends InventoryProvider>({
  label,
  providerType,
  field,
}: React.PropsWithChildren<IProviderSelectProps<T>>): JSX.Element | null => {
  // TODO use provider CRs for available options instead of inventory
  const providersQuery = useInventoryProvidersQuery();
  const { data } = providersQuery;
  const providers = ((data && data[providerType]) || []) as T[];

  const options = Object.values(providers).map((provider) => ({
    toString: () => provider.name,
    value: provider,
  })) as OptionWithValue<T>[];

  return (
    <ResolvedQuery result={providersQuery} errorTitle="Error loading providers">
      <FormGroup
        label={label}
        isRequired
        fieldId={`provider-select-${providerType}`}
        {...getFormGroupProps(field)}
      >
        <SimpleSelect
          id={`provider-select-${providerType}`}
          aria-label={label}
          options={options}
          value={[options.find((option) => option.value.name === field.value?.name)]}
          onChange={(selection) => field.setValue((selection as OptionWithValue<T>).value)}
          placeholderText="Select a provider..."
        />
      </FormGroup>
    </ResolvedQuery>
  );
};

export default ProviderSelect;
