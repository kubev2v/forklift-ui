import * as React from 'react';
import * as yup from 'yup';
import { Modal, Button, Form, FormGroup } from '@patternfly/react-core';
import { ConnectedIcon } from '@patternfly/react-icons';
import SimpleSelect, { OptionWithValue } from '@app/common/components/SimpleSelect';
import ValidatedTextInput from '@app/common/components/ValidatedTextInput';
import { ProviderType, PROVIDER_TYPE_NAMES } from '@app/common/constants';
import { useFormState, useFormField, getFormGroupProps } from '@app/common/hooks/useFormState';
import { usePausedPollingEffect } from '@app/common/context';
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
  usePausedPollingEffect();

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

  const openshiftForm = useFormState({
    providerType: providerTypeField,
    clusterName: useFormField('', yup.string().label('Cluster name').max(40).required()),
    url: useFormField('', yup.string().label('URL').max(40).required()),
    saToken: useFormField('', yup.string().label('Service account token').max(20).required()),
  });

  const providerType = providerTypeField.value;
  const formValues =
    providerType === ProviderType.vsphere ? vmwareForm.values : openshiftForm.values;
  const isFormValid =
    providerType === ProviderType.vsphere ? vmwareForm.isValid : openshiftForm.isValid;

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
              providerTypeField.setIsTouched(true);
            }}
            placeholderText="Select a provider type..."
          />
        </FormGroup>
        {providerType === ProviderType.vsphere ? (
          <>
            <ValidatedTextInput
              field={vmwareForm.fields.name}
              label="Name"
              isRequired
              fieldId="vmware-name"
            />
            <ValidatedTextInput
              field={vmwareForm.fields.hostname}
              label="Hostname"
              isRequired
              fieldId="vmware-hostname"
            />
            <ValidatedTextInput
              field={vmwareForm.fields.username}
              label="Username"
              isRequired
              fieldId="vmware-username"
            />
            <ValidatedTextInput
              field={vmwareForm.fields.password}
              type="password"
              label="Password"
              isRequired
              fieldId="vmware-password"
            />
          </>
        ) : null}
        {providerType === ProviderType.openshift ? (
          <>
            <ValidatedTextInput
              field={openshiftForm.fields.clusterName}
              label="Cluster name"
              isRequired
              fieldId="openshift-cluster-name"
            />
            <ValidatedTextInput
              field={openshiftForm.fields.url}
              label="URL"
              isRequired
              fieldId="openshift-url"
            />
            <ValidatedTextInput
              field={openshiftForm.fields.saToken}
              type="password"
              label="Service account token"
              isRequired
              fieldId="openshift-sa-token"
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
