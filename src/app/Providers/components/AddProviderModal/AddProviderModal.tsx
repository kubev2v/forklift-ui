import * as React from 'react';
import * as yup from 'yup';
import { Modal, Button, Form, FormGroup, TextInput } from '@patternfly/react-core';
import { ConnectedIcon } from '@patternfly/react-icons';
import SimpleSelect, { OptionWithValue } from '@app/common/components/SimpleSelect';
import { ProviderType, PROVIDER_TYPE_NAMES } from '@app/common/constants';
import { useFormState, useFormField } from '@app/common/hooks/useFormState';
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
  const providerTypeField = useFormField<ProviderType | null>({
    initialValue: null,
    schema: yup.mixed().label('Provider type').oneOf(Object.values(ProviderType)).required(),
  });

  // TODO determine the actual validation criteria for this form -- these are for testing

  const vmwareForm = useFormState({
    providerType: providerTypeField,
    name: useFormField<string>({
      initialValue: '',
      schema: yup.string().label('Name').min(2).max(20).required(),
    }),
    hostname: useFormField<string>({
      initialValue: '',
      schema: yup.string().label('Hostname').max(40).required(),
    }),
    username: useFormField<string>({
      initialValue: '',
      schema: yup.string().label('Username').max(20).required(),
    }),
    password: useFormField<string>({
      initialValue: '',
      schema: yup.string().label('Password').max(20).required(),
    }),
  });

  const cnvForm = useFormState({
    providerType: providerTypeField,
    clusterName: useFormField<string>({
      initialValue: '',
      schema: yup.string().label('Cluster name').max(40).required(),
    }),
    url: useFormField<string>({
      initialValue: '',
      schema: yup.string().label('URL').max(40).required(),
    }),
    saToken: useFormField<string>({
      initialValue: '',
      schema: yup.string().label('Service account token').max(20).required(),
    }),
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
          helperTextInvalid="TODO"
          validated="default" // TODO add state/validation/errors to this and other FormGroups
          className={!providerType ? 'extraSelectMargin' : ''}
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
            <FormGroup
              label="Name"
              isRequired
              fieldId="vmware-name"
              validated={vmwareForm.fields.name.isValid ? 'default' : 'error'}
              helperTextInvalid={vmwareForm.fields.name.error?.message}
            >
              <TextInput
                id="vmware-name"
                value={vmwareForm.fields.name.value}
                type="text"
                onChange={vmwareForm.fields.name.setValue}
                onBlur={() => vmwareForm.fields.name.setTouched(true)}
                validated={vmwareForm.fields.name.isValid ? 'default' : 'error'}
              />
            </FormGroup>
            <FormGroup
              label="Hostname"
              isRequired
              fieldId="vmware-hostname"
              validated={vmwareForm.fields.hostname.isValid ? 'default' : 'error'}
              helperTextInvalid={vmwareForm.fields.hostname.error?.message}
            >
              <TextInput
                id="vmware-hostname"
                value={vmwareForm.fields.hostname.value}
                type="text"
                onChange={vmwareForm.fields.hostname.setValue}
                onBlur={() => vmwareForm.fields.hostname.setTouched(true)}
                validated={vmwareForm.fields.hostname.isValid ? 'default' : 'error'}
              />
            </FormGroup>
            <FormGroup
              label="Username"
              isRequired
              fieldId="vmware-username"
              validated={vmwareForm.fields.username.isValid ? 'default' : 'error'}
              helperTextInvalid={vmwareForm.fields.username.error?.message}
            >
              <TextInput
                id="vmware-username"
                value={vmwareForm.fields.username.value}
                type="text"
                onChange={vmwareForm.fields.username.setValue}
                onBlur={() => vmwareForm.fields.username.setTouched(true)}
                validated={vmwareForm.fields.username.isValid ? 'default' : 'error'}
              />
            </FormGroup>
            <FormGroup
              label="Password"
              isRequired
              fieldId="vmware-password"
              validated={vmwareForm.fields.password.isValid ? 'default' : 'error'}
              helperTextInvalid={vmwareForm.fields.password.error?.message}
            >
              <TextInput
                id="vmware-password"
                value={vmwareForm.fields.password.value}
                type="password"
                onChange={vmwareForm.fields.password.setValue}
                onBlur={() => vmwareForm.fields.password.setTouched(true)}
                validated={vmwareForm.fields.password.isValid ? 'default' : 'error'}
              />
            </FormGroup>
          </>
        ) : null}
        {providerType === ProviderType.cnv ? (
          <>
            <FormGroup
              label="Cluster name"
              isRequired
              fieldId="cnv-cluster-name"
              validated={cnvForm.fields.clusterName.isValid ? 'default' : 'error'}
              helperTextInvalid={cnvForm.fields.clusterName.error?.message}
            >
              <TextInput
                id="cnv-cluster-name"
                value={cnvForm.fields.clusterName.value}
                type="text"
                onChange={cnvForm.fields.clusterName.setValue}
                onBlur={() => cnvForm.fields.clusterName.setTouched(true)}
                validated={cnvForm.fields.clusterName.isValid ? 'default' : 'error'}
              />
            </FormGroup>
            <FormGroup
              label="URL"
              isRequired
              fieldId="cnv-url"
              validated={cnvForm.fields.url.isValid ? 'default' : 'error'}
              helperTextInvalid={cnvForm.fields.url.error?.message}
            >
              <TextInput
                id="cnv-url"
                value={cnvForm.fields.url.value}
                type="text"
                onChange={cnvForm.fields.url.setValue}
                onBlur={() => cnvForm.fields.url.setTouched(true)}
                validated={cnvForm.fields.url.isValid ? 'default' : 'error'}
              />
            </FormGroup>
            <FormGroup
              label="Service account token"
              isRequired
              fieldId="cnv-sa-token"
              validated={cnvForm.fields.saToken.isValid ? 'default' : 'error'}
              helperTextInvalid={cnvForm.fields.saToken.error?.message}
            >
              <TextInput
                id="cnv-sa-token"
                value={cnvForm.fields.saToken.value}
                type="password"
                onChange={cnvForm.fields.saToken.setValue}
                onBlur={() => cnvForm.fields.saToken.setTouched(true)}
                validated={cnvForm.fields.saToken.isValid ? 'default' : 'error'}
              />
            </FormGroup>
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
