import * as React from 'react';
import { getFormGroupProps, ValidatedTextInput } from '@konveyor/lib-ui';
import {
  Button,
  FileUpload,
  FormGroup,
  List,
  ListItem,
  Popover,
  Radio,
} from '@patternfly/react-core';
import { HookFormState } from './AddEditHookModal';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { HelpIcon } from '@patternfly/react-icons';

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
}: IHookDefinitionInputsProps) => {
  // We don't need to persist the playbook filename, so it's not lifted to form state.
  const [playbookFilename, setPlaybookFilename] = React.useState('');
  return (
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
      <FormGroup
        isRequired
        label="Hook definition"
        fieldId="hook-definition"
        labelIcon={
          <Popover
            bodyContent={
              <>
                There are two options for adding a hook definition:
                <List component="ol">
                  <ListItem>
                    Add an ansible playbook file to be run. A default hook runner image is provided,
                    or you may choose your own.
                  </ListItem>
                  <ListItem>
                    Specify only a custom image which will run your defined entrypoint when loaded.
                  </ListItem>
                </List>
              </>
            }
          >
            <Button
              variant="plain"
              aria-label="More info for hook definition field"
              onClick={(e) => e.preventDefault()}
              className="pf-c-form__group-label-help"
            >
              <HelpIcon noVerticalAlign />
            </Button>
          </Popover>
        }
      >
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
          className={spacing.mbSm}
        />
        {fields.type.value === 'playbook' ? (
          <div className={`${spacing.mlLg} ${spacing.mbMd}`}>
            <FormGroup
              label="Upload your Ansible playbook file or paste its contents below."
              fieldId="playbook-yaml"
              {...getFormGroupProps(fields.playbook)}
            >
              <FileUpload
                id="playbook-yaml"
                type="text"
                value={fields.playbook.value}
                filename={playbookFilename}
                onChange={(value, filename) => {
                  fields.playbook.setValue(value as string);
                  fields.playbook.setIsTouched(true);
                  setPlaybookFilename(filename);
                }}
                onBlur={() => fields.playbook.setIsTouched(true)}
                validated={fields.playbook.isValid ? 'default' : 'error'}
              />
            </FormGroup>
            <ValidatedTextInput
              field={fields.ansibleImage}
              label="Ansible runtime image"
              fieldId="ansible-image"
              formGroupProps={{
                helperText: !fields.ansibleImage.isDirty
                  ? 'This is the default Ansible runtime image. You can change it to a custom image with your own modules.'
                  : null,
                className: spacing.mtMd,
              }}
            />
          </div>
        ) : null}
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
          className={spacing.mbXs}
        />
        {fields.type.value === 'image' ? (
          <ValidatedTextInput
            field={fields.customImage}
            isRequired
            fieldId="custom-image"
            formGroupProps={{
              className: spacing.mlLg,
            }}
          />
        ) : null}
      </FormGroup>
      <ValidatedTextInput
        field={fields.serviceAccount}
        label="Service account name"
        fieldId="service-account"
      />
    </>
  );
};

// TODO add serviceAccount field

export default HookDefinitionInputs;
/*
validated={form.fields.selectedNetworkName.isValid ? 'default' : 'error'}
            {...getFormGroupProps(form.fields.selectedNetworkName)}
            */
