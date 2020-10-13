import * as React from 'react';
import * as yup from 'yup';
import { Modal, Button, Form, FormGroup } from '@patternfly/react-core';
import { ConnectedIcon } from '@patternfly/react-icons';
import {
  useFormState,
  useFormField,
  getFormGroupProps,
  ValidatedTextInput,
} from '@konveyor/lib-ui';

import SimpleSelect, { OptionWithValue } from '@app/common/components/SimpleSelect';
import { ProviderType, PROVIDER_TYPE_NAMES } from '@app/common/constants';
import { usePausedPollingEffect } from '@app/common/context';
import './AddProviderModal.css';
import { useCreateProvider } from '@app/queries';
import { useVMwareFormState, VMwareFormState } from './useVMwareFormState';
import { useOpenshiftFormState, OpenshiftFormState } from './useOpenshiftFormState';

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

  const providerTypeField = useFormField<ProviderType | null>(
    null,
    yup.mixed().label('Provider type').oneOf(Object.values(ProviderType)).required()
  );
  const vmwareForm = useVMwareFormState(providerTypeField);
  const openshiftForm = useOpenshiftFormState(providerTypeField);

  // TODO determine the actual validation criteria for this form -- these are for testing

  const providerType = providerTypeField.value;
  const formValues: VMwareFormState['values'] | OpenshiftFormState['values'] =
    providerType === ProviderType.vsphere ? vmwareForm.values : openshiftForm.values;
  const isFormValid =
    providerType === ProviderType.vsphere ? vmwareForm.isValid : openshiftForm.isValid;

  const { createProvider } = useCreateProvider();

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
            createProvider(formValues);
            //TODO: tie in onClose to success or error from query. handle error somehow
            onClose();
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
            aria-label="Provider type"
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
