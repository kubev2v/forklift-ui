import * as React from 'react';
import { ValidatedTextInput } from '@konveyor/lib-ui';
import { Popover, Button } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';
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
    <ValidatedTextInput
      field={fields.url}
      label="Git repository URL"
      isRequired
      fieldId="hook-url"
      formGroupProps={{
        labelIcon: (
          <Popover bodyContent="This is the Git repository where the Ansible playbook is located.">
            <Button
              variant="plain"
              aria-label="More info for url field"
              onClick={(e) => e.preventDefault()}
              aria-describedby="hook-url-info"
              className="pf-c-form__group-label-help"
            >
              <HelpIcon noVerticalAlign />
            </Button>
          </Popover>
        ),
      }}
    />
    <ValidatedTextInput field={fields.branch} label="Branch" isRequired fieldId="hook-branch" />
  </>
);

export default HookDefinitionInputs;
