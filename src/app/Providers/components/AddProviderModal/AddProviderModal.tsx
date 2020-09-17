import * as React from 'react';
import * as yup from 'yup';
import { Modal, Button, Form, FormGroup } from '@patternfly/react-core';
import { ConnectedIcon } from '@patternfly/react-icons';
import SimpleSelect, { OptionWithValue } from '@app/common/components/SimpleSelect';
import ValidatedTextInputField from '@app/common/components/ValidatedTextInputField';
import { ProviderType, PROVIDER_TYPE_NAMES } from '@app/common/constants';
import { useFormState, useFormField, getFormGroupProps } from '@app/common/hooks/useFormState';
import './AddProviderModal.css';

interface IAddProviderModalProps {
  onClose: () => void;
}

const PROVIDER_TYPE_OPTIONS = Object.values(ProviderType).map((type) => ({
  toString: () => PROVIDER_TYPE_NAMES[type],
  value: type,
})) as OptionWithValue<ProviderType>[];

const AddProviderModal: React.FunctionComponent<IAddProviderModalProps> = ({
  onClose,
}: IAddProviderModalProps) => {
  // TODO determine the actual validation criteria for this form -- these are for testing

  const providerTypeField = useFormField<ProviderType | null>(
    null,
    yup.mixed().label('Provider type').oneOf(Object.values(ProviderType)).required()
  );

  const vmwareForm = useFormState({
    providerType: providerTypeField,
    name: useFormField('', yup.string().label('Name').min(2).max(20).required()),
    hostname: useFormField('', yup.string().label('Hostname').max(40).required()),
    username: useFormField('', yup.string().label('Username').max(20).required()),
    password: useFormField('', yup.string().label('Password').max(20).required()),
  });

  const cnvForm = useFormState({
    providerType: providerTypeField,
    clusterName: useFormField('', yup.string().label('Cluster name').max(40).required()),
    url: useFormField('', yup.string().label('URL').max(40).required()),
    saToken: useFormField('', yup.string().label('Service account token').max(20).required()),
  });

  const providerType = providerTypeField.value;
  const formValues = providerType === ProviderType.vsphere ? vmwareForm.values : cnvForm.values;
  const isFormValid = providerType === ProviderType.vsphere ? vmwareForm.isValid : cnvForm.isValid;

  return (
    <Modal
      className="addProviderModal"
      variant="small"
      title="Add provider"
      isOpen
      onClose={onClose}
      actions={[
        <Button
          key="confirm"
          variant="primary"
          isDisabled={!isFormValid}
          onClick={() => {
            console.log('TODO: submit form!', formValues);
            alert('TODO');
          }}
        >
          Add
        </Button>,
        <Button key="cancel" variant="link" onClick={onClose}>
          Cancel
        </Button>,
      ]}
    >
      <Form>
        <FormGroup
          label="Type"
          isRequired
          fieldId="provider-type"
          className={!providerType ? 'extraSelectMargin' : ''}
          {...getFormGroupProps(vmwareForm.fields.providerType)}
        >
          <SimpleSelect
            id="provider-type"
            options={PROVIDER_TYPE_OPTIONS}
            value={[PROVIDER_TYPE_OPTIONS.find((option) => option.value === providerType)]}
            onChange={(selection) => {
              providerTypeField.setValue((selection as OptionWithValue<ProviderType>).value);
              providerTypeField.setTouched(true);
            }}
            placeholderText="Select a provider type..."
          />
        </FormGroup>
        {providerType === ProviderType.vsphere ? (
          <>
            <ValidatedTextInputField
              field={vmwareForm.fields.name}
              label="Name"
              isRequired
              fieldId="vmware-name"
            />
            <ValidatedTextInputField
              field={vmwareForm.fields.hostname}
              label="Hostname"
              isRequired
              fieldId="vmware-hostname"
            />
            <ValidatedTextInputField
              field={vmwareForm.fields.username}
              label="Username"
              isRequired
              fieldId="vmware-username"
            />
            <ValidatedTextInputField
              field={vmwareForm.fields.password}
              type="password"
              label="Password"
              isRequired
              fieldId="vmware-password"
            />
          </>
        ) : null}
        {providerType === ProviderType.cnv ? (
          <>
            <ValidatedTextInputField
              field={cnvForm.fields.clusterName}
              label="Cluster name"
              isRequired
              fieldId="cnv-cluster-name"
            />
            <ValidatedTextInputField
              field={cnvForm.fields.url}
              label="URL"
              isRequired
              fieldId="cnv-url"
            />
            <ValidatedTextInputField
              field={cnvForm.fields.saToken}
              type="password"
              label="Service account token"
              isRequired
              fieldId="cnv-sa-token"
            />
          </>
        ) : null}
        {providerType ? (
          <div>
            <Button variant="link" isInline icon={<ConnectedIcon />} onClick={() => alert('TODO')}>
              Check connection
            </Button>
          </div>
        ) : null}
      </Form>
    </Modal>
  );
};

export default AddProviderModal;
