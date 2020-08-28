import * as React from 'react';
import { Modal, Button } from '@patternfly/react-core';

interface IAddEditMappingModalProps {
  title: string;
  onClose: () => void;
}

// TODO paramaterize similarly to MappingsTable so it can be used for both network and storage mappings?
// Split it into AddEditNetworkMappingModal and AddEditStorageMappingModal if necessary

const AddEditMappingModal: React.FunctionComponent<IAddEditMappingModalProps> = ({
  title,
  onClose,
}: IAddEditMappingModalProps) => (
  <Modal
    variant="small"
    title={title}
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
    <h1>TODO: mapping builder form here</h1>
  </Modal>
);

export default AddEditMappingModal;
