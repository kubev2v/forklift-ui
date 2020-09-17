import * as React from 'react';
import * as yup from 'yup';
import { Modal, Button, Form, FormGroup, TextInput } from '@patternfly/react-core';
import { ConnectedIcon } from '@patternfly/react-icons';
import SimpleSelect, { OptionWithValue } from '@app/common/components/SimpleSelect';
import { ProviderType, PROVIDER_TYPE_NAMES } from '@app/common/constants';
import {
  useFormState,
  useFormField,
  getFormGroupProps,
  getTextInputProps,
} from '@app/common/hooks/useFormState';
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
            <FormGroup
              label="Name"
              isRequired
              fieldId="vmware-name"
              {...getFormGroupProps(vmwareForm.fields.name)}
            >
              <TextInput
                id="vmware-name"
                type="text"
                {...getTextInputProps(vmwareForm.fields.name)}
              />
            </FormGroup>
            <FormGroup
              label="Hostname"
              isRequired
              fieldId="vmware-hostname"
              {...getFormGroupProps(vmwareForm.fields.hostname)}
            >
              <TextInput
                id="vmware-hostname"
                type="text"
                {...getTextInputProps(vmwareForm.fields.hostname)}
              />
            </FormGroup>
            <FormGroup
              label="Username"
              isRequired
              fieldId="vmware-username"
              {...getFormGroupProps(vmwareForm.fields.username)}
            >
              <TextInput
                id="vmware-username"
                type="text"
                {...getTextInputProps(vmwareForm.fields.username)}
              />
            </FormGroup>
            <FormGroup
              label="Password"
              isRequired
              fieldId="vmware-password"
              {...getFormGroupProps(vmwareForm.fields.password)}
            >
              <TextInput
                id="vmware-password"
                type="password"
                {...getTextInputProps(vmwareForm.fields.password)}
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
              {...getFormGroupProps(cnvForm.fields.clusterName)}
            >
              <TextInput
                id="cnv-cluster-name"
                type="text"
                {...getTextInputProps(cnvForm.fields.clusterName)}
              />
            </FormGroup>
            <FormGroup
              label="URL"
              isRequired
              fieldId="cnv-url"
              {...getFormGroupProps(cnvForm.fields.url)}
            >
              <TextInput id="cnv-url" type="text" {...getTextInputProps(cnvForm.fields.url)} />
            </FormGroup>
            <FormGroup
              label="Service account token"
              isRequired
              fieldId="cnv-sa-token"
              {...getFormGroupProps(cnvForm.fields.saToken)}
            >
              <TextInput
                id="cnv-sa-token"
                type="password"
                {...getTextInputProps(cnvForm.fields.saToken)}
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
