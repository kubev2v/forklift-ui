import * as React from 'react';
import { Modal, Button, Form, FormGroup, TextInput } from '@patternfly/react-core';
import { ConnectedIcon } from '@patternfly/react-icons';
import SimpleSelect, { OptionWithValue } from '@app/common/components/SimpleSelect';
import { IHost, IHostNetwork } from '@app/queries/types';
import { formatHostNetwork } from './helpers';
import './SelectNetworkModal.css';

interface ISelectNetworkModalProps {
  selectedHosts: IHost[];
  onClose: () => void;
}

// TODO replace the mock data with real data
const MOCK_NETWORKS: IHostNetwork[] = [
  { name: 'storage_network', address: '192.168.0.1/24' },
  { name: 'compute_network', address: '192.168.0.2/24' },
  { name: 'other_network', address: '192.168.0.3/24' },
];

const SelectNetworkModal: React.FunctionComponent<ISelectNetworkModalProps> = ({
  selectedHosts,
  onClose,
}: ISelectNetworkModalProps) => {
  console.log('TODO: generate options for selected hosts: ', selectedHosts);
  const networkOptions = MOCK_NETWORKS.map((network) => ({
    toString: () => formatHostNetwork(network),
    value: network.name,
  }));

  // TODO add a library like Formik, react-final-form, react-hook-form and use it for validation?
  //   or maybe roll our own simple validation? maybe use Yup?
  const [adminUserId, setAdminUserId] = React.useState<string>('');
  const [adminPassword, setAdminPassword] = React.useState<string>('');
  const [selectedNetwork, setSelectedNetwork] = React.useState<string>(networkOptions[0].value); // TODO use actual pre-selected network

  return (
    <Modal
      className="selectNetworkModal"
      variant="small"
      title="Select migration network"
      isOpen
      onClose={onClose}
      actions={[
        <Button key="confirm" variant="primary" onClick={() => alert('TODO')}>
          Add
        </Button>,
        <Button key="cancel" variant="link" onClick={onClose}>
          Cancel
        </Button>,
      ]}
    >
      <Form>
        <FormGroup label="Host admin userid" isRequired fieldId="admin-userid">
          <TextInput id="admin-userid" value={adminUserId} type="text" onChange={setAdminUserId} />
        </FormGroup>
        <FormGroup label="Host admin password" isRequired fieldId="admin-password">
          <TextInput
            id="admin-password"
            value={adminPassword}
            type="password"
            onChange={setAdminPassword}
          />
        </FormGroup>
        <FormGroup
          label="Network"
          isRequired
          fieldId="network"
          helperTextInvalid="TODO"
          validated="default" // TODO add state/validation/errors to this and other FormGroups
          className="extraSelectMargin"
        >
          <SimpleSelect
            id="network"
            aria-label="Network"
            options={networkOptions}
            value={[networkOptions.find((option) => option.value === selectedNetwork)]}
            onChange={(selection) =>
              setSelectedNetwork((selection as OptionWithValue<string>).value)
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
