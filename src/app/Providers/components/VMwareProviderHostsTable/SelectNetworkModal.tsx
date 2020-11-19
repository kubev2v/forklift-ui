import * as React from 'react';
import * as yup from 'yup';
import { Modal, Button, Form, FormGroup, Checkbox } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import {
  useFormState,
  useFormField,
  getFormGroupProps,
  ValidatedTextInput,
} from '@konveyor/lib-ui';

import SimpleSelect, { OptionWithValue } from '@app/common/components/SimpleSelect';
import { IHost, IHostNetworkAdapter } from '@app/queries/types';

import './SelectNetworkModal.css';
import { formatHostNetworkAdapter } from './helpers';

interface ISelectNetworkModalProps {
  selectedHosts: IHost[];
  onClose: () => void;
}

const SelectNetworkModal: React.FunctionComponent<ISelectNetworkModalProps> = ({
  selectedHosts,
  onClose,
}: ISelectNetworkModalProps) => {
  const isReusingCredentials = useFormField(true, yup.boolean().required());
  const usernameSchema = yup.string().max(320).label('Host admin username');
  const passwordSchema = yup.string().max(256).label('Host admin password');
  const form = useFormState({
    selectedNetworkAdapter: useFormField<IHostNetworkAdapter | null>(
      null,
      yup.mixed<IHostNetworkAdapter>().label('Host network').required()
    ),
    adminUsername: useFormField(
      '',
      isReusingCredentials.value ? usernameSchema : usernameSchema.required()
    ),
    adminPassword: useFormField(
      '',
      isReusingCredentials.value ? passwordSchema : passwordSchema.required()
    ),
    isReusingCredentials,
  });

  const commonNetworkAdapters: IHostNetworkAdapter[] = selectedHosts[0].networkAdapters.filter(
    ({ name, ipAddress }) =>
      selectedHosts.every((host) =>
        host.networkAdapters.some((na) => na.name === name && na.ipAddress === ipAddress)
      )
  );

  const networkOptions = commonNetworkAdapters.map((networkAdapter) => ({
    toString: () => formatHostNetworkAdapter(networkAdapter),
    value: networkAdapter,
    props: { description: `${networkAdapter.linkSpeed} Mbps; MTU: ${networkAdapter.mtu}` },
  }));

  const add = () => {
    alert('TODO');
    if (form.isValid) {
      console.log('TODO: submit form!', form.values);
      onClose();
    }
  };

  return (
    <Modal
      className="selectNetworkModal"
      variant="small"
      title="Select migration network"
      isOpen
      onClose={onClose}
      actions={[
        <Button key="confirm" variant="primary" isDisabled={!form.isValid} onClick={add}>
          Add
        </Button>,
        <Button key="cancel" variant="link" onClick={onClose}>
          Cancel
        </Button>,
      ]}
    >
      <Form className={form.values.isReusingCredentials ? 'extraSelectMargin' : ''}>
        <FormGroup
          label="Network"
          isRequired
          fieldId="network"
          validated={form.fields.selectedNetworkAdapter.isValid ? 'default' : 'error'}
          {...getFormGroupProps(form.fields.selectedNetworkAdapter)}
        >
          <SimpleSelect
            id="network"
            aria-label="Network"
            options={networkOptions}
            value={[
              networkOptions.find(
                (option) => option.value.ipAddress === form.values.selectedNetworkAdapter?.ipAddress
              ),
            ]}
            onChange={(selection) =>
              form.fields.selectedNetworkAdapter.setValue(
                (selection as OptionWithValue<IHostNetworkAdapter>).value
              )
            }
            placeholderText="Select a network..."
          />
        </FormGroup>
        <Checkbox
          label="Reuse vSphere credentials"
          id="reuse-credentials-checkbox"
          isChecked={form.values.isReusingCredentials}
          onChange={() =>
            form.fields.isReusingCredentials.setValue(!form.values.isReusingCredentials)
          }
          className={spacing.mtMd}
        />
        {!form.values.isReusingCredentials ? (
          <>
            <ValidatedTextInput
              field={form.fields.adminUsername}
              label="Host admin username"
              isRequired
              fieldId="admin-username"
            />
            <ValidatedTextInput
              type="password"
              field={form.fields.adminPassword}
              label="Host admin password"
              isRequired
              fieldId="admin-password"
            />
          </>
        ) : null}
        {/* TODO re-enable this when we have the API capability
        <div>
          <Button variant="link" isInline icon={<ConnectedIcon />} onClick={() => alert('TODO')}>
            Check connections
          </Button>
        </div>
        */}
      </Form>
    </Modal>
  );
};

export default SelectNetworkModal;
