import * as React from 'react';
import { ValidatedTextInput } from '@konveyor/lib-ui';
import { FormGroup, Radio } from '@patternfly/react-core';
import { HookFormState } from './AddEditHookModal';

interface IHookDefinitionInputsProps {
  fields: HookFormState['fields']; // Can come from either HookFormState or PlanHookInstanceFormState since they share these fields!
  editingHookName: string | null;
  hideName?: boolean;
  children?: React.ReactNode; // Fields to render after the name field... convenient for what we need, may need to refactor if we change field order
}

const HookDefinitionInputs: React.FunctionComponent<IHookDefinitionInputsProps> = ({
  fields,
  editingHookName,
  hideName = false,
  children = null,
}: IHookDefinitionInputsProps) => (
  <>
    {!hideName ? (
      <ValidatedTextInput
        field={fields.name}
        label="Hook name"
        isRequired
        fieldId="hook-name"
        inputProps={{ isDisabled: !!editingHookName }}
      />
    ) : null}
    {children}
    <FormGroup isRequired label="Hook definition" fieldId="hook-definition">
      <Radio
        id="hook-definition-ansible"
        name="hook-definition"
        label="Ansible playbook"
        isChecked={fields.type.value === 'playbook'}
        onChange={(checked) => {
          if (checked) {
            fields.type.setValue('playbook');
          }
        }}
        body={fields.type.value === 'playbook' ? 'TODO' : null}
      />
      <Radio
        id="hook-definition-image"
        name="hook-definition"
        label="Custom container image"
        isChecked={fields.type.value === 'image'}
        onChange={(checked) => {
          if (checked) {
            fields.type.setValue('image');
          }
        }}
        body={fields.type.value === 'image' ? 'TODO' : null}
      />
    </FormGroup>
    {/*<ValidatedTextInput field={fields.branch} label="Branch" isRequired fieldId="hook-branch" />*/}
  </>
);

// TODO add serviceAccount field

export default HookDefinitionInputs;
/*
validated={form.fields.selectedNetworkName.isValid ? 'default' : 'error'}
            {...getFormGroupProps(form.fields.selectedNetworkName)}
            */
