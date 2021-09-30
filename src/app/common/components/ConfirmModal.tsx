import * as React from 'react';
import { Modal, Stack, Flex, Button, ModalProps } from '@patternfly/react-core';
import { QuerySpinnerMode, ResolvedQuery } from './ResolvedQuery';
import { UnknownMutationResult } from '../types';

// TODO lib-ui candidate

interface IConfirmModalProps {
  variant?: ModalProps['variant'];
  isOpen: boolean;
  toggleOpen: () => void;
  mutateFn: () => void;
  mutateResult?: UnknownMutationResult;
  title: string;
  body: React.ReactNode;
  confirmButtonText: string;
  cancelButtonText?: string;
  errorText?: string;
}

const ConfirmModal: React.FunctionComponent<IConfirmModalProps> = ({
  variant = 'small',
  isOpen,
  toggleOpen,
  mutateFn,
  mutateResult,
  title,
  body,
  confirmButtonText,
  cancelButtonText = 'Cancel',
  errorText = 'Error performing action',
}: IConfirmModalProps) => {
  React.useEffect(() => {
    if (!isOpen) mutateResult?.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return isOpen ? (
    <Modal
      variant={variant}
      title={title}
      isOpen
      onClose={toggleOpen}
      footer={
        <Stack hasGutter>
          {mutateResult ? (
            <ResolvedQuery
              result={mutateResult}
              errorTitle={errorText}
              spinnerMode={QuerySpinnerMode.Inline}
            />
          ) : null}
          <Flex spaceItems={{ default: 'spaceItemsSm' }}>
            <Button
              id="modal-confirm-button"
              key="confirm"
              variant="primary"
              onClick={mutateFn}
              isDisabled={mutateResult?.isLoading}
            >
              {confirmButtonText}
            </Button>
            <Button
              id="modal-cancel-button"
              key="cancel"
              variant="link"
              onClick={toggleOpen}
              isDisabled={mutateResult?.isLoading}
            >
              {cancelButtonText}
            </Button>
          </Flex>
        </Stack>
      }
    >
      {body}
    </Modal>
  ) : null;
};

export default ConfirmModal;
