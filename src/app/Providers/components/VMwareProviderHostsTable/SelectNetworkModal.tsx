import * as React from 'react';
import * as yup from 'yup';
import { Modal, Button, Form, FormGroup } from '@patternfly/react-core';
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
  const form = useFormState({
    // TODO add a checkbox for reusing the vsphere creds and hiding these fields
    adminUserId: useFormField('', yup.string().max(320).label('User Id').required()),
    adminPassword: useFormField('', yup.string().max(256).label('Password').required()),
    selectedNetworkAdapter: useFormField<IHostNetworkAdapter | null>(
      null,
      yup.mixed<IHostNetworkAdapter>().label('Host network').required()
    ),
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
      <Form>
        <ValidatedTextInput
          field={form.fields.adminUserId}
          label="Host admin userid"
          isRequired
          fieldId="admin-userid"
        />
        <ValidatedTextInput
          field={form.fields.adminPassword}
          label="Host admin password"
          isRequired
          fieldId="admin-password"
        />
        <FormGroup
          label="Network"
          isRequired
          fieldId="network"
          validated={form.fields.selectedNetworkAdapter.isValid ? 'default' : 'error'}
          className="extraSelectMargin"
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
