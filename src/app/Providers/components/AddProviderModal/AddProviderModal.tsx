import * as React from 'react';
import { Modal, Button, Form, FormGroup, TextInput } from '@patternfly/react-core';
import { ConnectedIcon } from '@patternfly/react-icons';
import SimpleSelect, { OptionWithValue } from '@app/common/components/SimpleSelect';
import { ProviderType, PROVIDER_TYPE_NAMES } from '@app/common/constants';
import './AddProviderModal.css';

import { cnvProviderSchema, vmwareProviderSchema } from '../../ProviderSchema';

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
  // TODO add a library like Formik, react-final-form, react-hook-form and use it for validation?
  //   or maybe roll our own simple validation? maybe use Yup?
  const [providerType, setProviderType] = React.useState<ProviderType | null>(null);

  const [vmwareName, setVmwareName] = React.useState<string>('');
  const [vmwareHostname, setVmwareHostname] = React.useState<string>('');
  const [vmwareUsername, setVmwareUsername] = React.useState<string>('');
  const [vmwarePassword, setVmwarePassword] = React.useState<string>('');

  const [cnvClusterName, setCnvClusterName] = React.useState<string>('');
  const [cnvUrl, setCnvUrl] = React.useState<string>('');
  const [cnvSaToken, setCnvSaToken] = React.useState<string>('');

  const validForm = (form) => {
    console.log(form);
    alert('valid form');
  };

  const validateForm = () => {
    if (providerType === ProviderType.vsphere) {
      const vmwareProvider = {
        providerType,
        vmwareName,
        vmwareHostname,
        vmwareUsername,
        vmwarePassword,
      };

      vmwareProviderSchema
        .validate(vmwareProvider)
        .then(() => validForm(vmwareProvider))
        .catch(function (err) {
          console.log(err);
        });
    }

    if (providerType === ProviderType.cnv) {
      const cnvProvider = {
        providerType,
        cnvClusterName,
        cnvUrl,
        cnvSaToken,
      };

      cnvProviderSchema
        .validate(cnvProvider)
        .then(() => validForm(cnvProvider))
        .catch(function (err) {
          console.log(err);
        });
    }
  };

  return (
    <Modal
      className="addProviderModal"
      variant="small"
      title="Add provider"
      isOpen
      onClose={onClose}
      actions={[
        // <Button key="confirm" variant="primary" onClick={() => alert('TODO')}>
        <Button key="confirm" variant="primary" onClick={validateForm}>
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
            onChange={(selection) =>
              setProviderType((selection as OptionWithValue<ProviderType>).value)
            }
            placeholderText="Select a provider type..."
          />
        </FormGroup>
        {providerType === ProviderType.vsphere ? (
          <>
            <FormGroup label="Name" isRequired fieldId="vmware-name">
              <TextInput id="vmware-name" value={vmwareName} type="text" onChange={setVmwareName} />
            </FormGroup>
            <FormGroup label="Hostname" isRequired fieldId="vmware-hostname">
              <TextInput
                id="vmware-hostname"
                value={vmwareHostname}
                type="text"
                onChange={setVmwareHostname}
              />
            </FormGroup>
            <FormGroup label="Username" isRequired fieldId="vmware-username">
              <TextInput
                id="vmware-username"
                value={vmwareUsername}
                type="text"
                onChange={setVmwareUsername}
              />
            </FormGroup>
            <FormGroup label="Password" isRequired fieldId="vmware-password">
              <TextInput
                id="vmware-password"
                value={vmwarePassword}
                type="password"
                onChange={setVmwarePassword}
              />
            </FormGroup>
          </>
        ) : null}
        {providerType === ProviderType.cnv ? (
          <>
            <FormGroup label="Cluster name" isRequired fieldId="cnv-cluster-name">
              <TextInput
                id="cnv-cluster-name"
                value={cnvClusterName}
                type="text"
                onChange={setCnvClusterName}
              />
            </FormGroup>
            <FormGroup label="URL" isRequired fieldId="cnv-url">
              <TextInput id="cnv-url" value={cnvUrl} type="text" onChange={setCnvUrl} />
            </FormGroup>
            <FormGroup label="Service account token" isRequired fieldId="cnv-sa-token">
              <TextInput
                id="cnv-sa-token"
                value={cnvSaToken}
                type="password"
                onChange={setCnvSaToken}
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
