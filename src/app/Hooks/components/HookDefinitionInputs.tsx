import { IHook } from '@app/queries/types';
import { ValidatedTextInput } from '@konveyor/lib-ui';
import { Popover, Button } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';
import * as React from 'react';
import { HookDefinitionFormState } from './AddEditHookModal';

interface IHookDefinitionInputsProps {
  fields: HookDefinitionFormState['fields'];
  hookBeingEdited: IHook | null;
}

const HookDefinitionInputs: React.FunctionComponent<IHookDefinitionInputsProps> = ({
  fields,
  hookBeingEdited,
}: IHookDefinitionInputsProps) => (
  <>
    <ValidatedTextInput field={fields.name} label="Hook name" isRequired fieldId="hook-name" />
    <ValidatedTextInput
      field={fields.url}
      label="Git repository URL"
      isRequired
      fieldId="hook-url"
      inputProps={{
        isDisabled: !!hookBeingEdited,
      }}
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
