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
import { IHost, IHostNetwork } from '@app/queries/types';
import { formatHostNetwork } from './helpers';

import './SelectNetworkModal.css';

interface ISelectNetworkModalProps {
  selectedHosts: IHost[];
  onClose: () => void;
}
// TODO Replace once https://github.com/konveyor/virt-ui/issues/85 has been addressed.
interface ITempHostNetwork {
  name: string;
  address: string;
  bandwidth: string;
  mtu: number;
  isDefault?: boolean;
}

const MOCK_NETWORKS: ITempHostNetwork[] = [
  {
    name: 'storage_network',
    address: '192.168.0.1/24',
    bandwidth: '1 GB/s',
    mtu: 1499,
    isDefault: true,
  },
  { name: 'compute_network', address: '192.168.0.2/24', bandwidth: '2 GB/s', mtu: 1400 },
  { name: 'other_network', address: '192.168.0.3/24', bandwidth: '3 GB/s', mtu: 1500 },
];
// End TODO

const SelectNetworkModal: React.FunctionComponent<ISelectNetworkModalProps> = ({
  selectedHosts,
  onClose,
}: ISelectNetworkModalProps) => {
  const form = useFormState({
    adminUserId: useFormField('', yup.string().label('User Id').required()),
    adminPassword: useFormField('', yup.string().label('Password').required()),
    selectedNetwork: useFormField(null, yup.mixed<IHostNetwork>().label('Host network').required()),
  });

  // TODO Replace once https://github.com/konveyor/virt-ui/issues/85 has been addressed.
  console.log('TODO: generate options for selected hosts: ', selectedHosts);
  const networkOptions = MOCK_NETWORKS.map((network) => ({
    toString: () => formatHostNetwork(network),
    value: network.name,
    props: { description: `${network.bandwidth}; MTU:${network.mtu}` },
  }));
  // End TODO

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
          validated={form.fields.selectedNetwork.isValid ? 'default' : 'error'}
          className="extraSelectMargin"
          {...getFormGroupProps(form.fields.selectedNetwork)}
        >
          <SimpleSelect
            id="network"
            aria-label="Network"
            options={networkOptions}
            value={[
              networkOptions.find((option) => option.value === form.fields.selectedNetwork.value),
            ]}
            onChange={(selection) =>
              form.fields.selectedNetwork.setValue(
                (selection as OptionWithValue<IHostNetwork>).value
              )
            }
            placeholderText="Select a network..."
          />
        </FormGroup>
        <div>
          <Button variant="link" isInline icon={<ConnectedIcon />} onClick={() => alert('TODO')}>
            Check connections
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default SelectNetworkModal;
