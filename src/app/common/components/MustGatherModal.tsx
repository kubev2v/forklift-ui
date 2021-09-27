import * as React from 'react';
import { Button, TextContent, Modal, Text } from '@patternfly/react-core';
import { MustGatherContext, NotificationContext, MustGatherObjType } from '@app/common/context';
import { useMustGatherMutation } from '@app/queries';

export const MustGatherModal: React.FunctionComponent = () => {
  const mustGatherContext = React.useContext(MustGatherContext);
  const { pushNotification } = React.useContext(NotificationContext);

  const handleMustGatherSuccess = () => {
    if (mustGatherContext.activeMustGather) {
      pushNotification({
        title: `Started must gather for ${mustGatherContext.activeMustGather.customName}`,
        message: '',
        key: mustGatherContext.activeMustGather.customName,
        variant: 'info',
        actionClose: true,
        timeout: 4000,
      });
    }
  };

  const handleMustGatherError = () => {
    if (mustGatherContext.activeMustGather) {
      pushNotification({
        title: `Could not run must gather for ${mustGatherContext.activeMustGather.customName}`,
        message: '',
        key: mustGatherContext.activeMustGather.customName,
        variant: 'danger',
        actionClose: true,
      });
    }
  };

  const registerMustGather = useMustGatherMutation(
    'must-gather',
    handleMustGatherSuccess,
    handleMustGatherError
  );

  const handleMustGatherRequest = ({ customName, type }: MustGatherObjType) => {
    registerMustGather.mutate({
      'custom-name': customName,
      command:
        type === 'plan'
          ? `PLAN=${customName} /usr/bin/targeted`
          : `VM=${customName} /usr/bin/targeted`,
    });

    mustGatherContext.setMustGatherModalOpen(false);
  };

  return (
    <Modal
      variant="medium"
      title="Get logs"
      isOpen={mustGatherContext.mustGatherModalOpen}
      onClose={() => {
        mustGatherContext.setMustGatherModalOpen(false);
      }}
      actions={[
        <Button
          key="confirm"
          variant="primary"
          onClick={() => {
            mustGatherContext.activeMustGather &&
              handleMustGatherRequest(mustGatherContext.activeMustGather);
          }}
        >
          Get logs
        </Button>,
        <Button
          key="cancel"
          variant="link"
          onClick={() => {
            mustGatherContext.setMustGatherModalOpen(false);
          }}
        >
          Cancel
        </Button>,
      ]}
    >
      <TextContent>
        <Text component="p">
          The migration logs will be consolidated into a single archive file named{' '}
          <strong>must-gather-{mustGatherContext.activeMustGather?.customName}.tar.gz</strong>.
        </Text>
        <Text component="p">
          The log collection process can take several minutes. You will be notified when the process
          is complete and the tar archive file is ready to download.
        </Text>
      </TextContent>
    </Modal>
  );
};
