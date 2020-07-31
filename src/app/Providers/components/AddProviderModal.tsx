import * as React from 'react';
import { Modal, Button } from '@patternfly/react-core';

interface IAddProviderModalProps {
  onClose: () => void;
}

const AddProviderModal: React.FunctionComponent<IAddProviderModalProps> = ({
  onClose,
}: IAddProviderModalProps) => (
  <Modal
    variant="small"
    title="Add provider"
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
    TODO: modal contents
  </Modal>
);

export default AddProviderModal;
