import * as React from 'react';
import { Modal, Stack, Flex, Button } from '@patternfly/react-core';
import { MutationResult } from 'react-query';
import QueryResultStatus from './QueryResultStatus';

interface IConfirmDeleteModalProps {
  isOpen: boolean;
  toggleOpen: () => void;
  deleteFn: () => void;
  deleteResult: MutationResult<unknown>;
  title: string;
  body: React.ReactNode;
  deleteButtonText?: string;
  errorText: string;
}

const ConfirmDeleteModal: React.FunctionComponent<IConfirmDeleteModalProps> = ({
  isOpen,
  toggleOpen,
  deleteFn,
  deleteResult,
  title,
  body,
  deleteButtonText = 'Delete',
  errorText,
}: IConfirmDeleteModalProps) => {
  React.useEffect(() => {
    if (!isOpen) deleteResult.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return isOpen ? (
    <Modal
      variant="small"
      title={title}
      isOpen
      onClose={toggleOpen}
      footer={
        <Stack hasGutter>
          <QueryResultStatus result={deleteResult} errorTitle={errorText} />
          <Flex spaceItems={{ default: 'spaceItemsSm' }}>
            <Button
              key="delete"
              variant="primary"
              onClick={deleteFn}
              isDisabled={deleteResult.isLoading}
            >
              {deleteButtonText}
            </Button>
            <Button
              key="cancel"
              variant="link"
              onClick={toggleOpen}
              isDisabled={deleteResult.isLoading}
            >
              Cancel
            </Button>
          </Flex>
        </Stack>
      }
    >
      {body}
    </Modal>
  ) : null;
};

export default ConfirmDeleteModal;
