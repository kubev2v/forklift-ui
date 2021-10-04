import * as React from 'react';
import ConfirmModal, { IConfirmModalProps } from '@app/common/components/ConfirmModal';
import { IPlan } from '@app/queries/types';
import { TextContent, Text } from '@patternfly/react-core';

interface IMigrateOrCutoverConfirmModalProps
  extends Pick<IConfirmModalProps, 'isOpen' | 'toggleOpen' | 'mutateFn' | 'mutateResult'> {
  plan: IPlan;
  action: 'start' | 'restart' | 'cutover';
}

const MigrateOrCutoverConfirmModal: React.FunctionComponent<IMigrateOrCutoverConfirmModalProps> = ({
  isOpen,
  toggleOpen,
  mutateFn,
  mutateResult,
  plan,
  action,
}: IMigrateOrCutoverConfirmModalProps) => {
  const verb = action === 'restart' ? 'Restart' : 'Start';
  const noun =
    action === 'cutover' ? 'cutover' : plan.spec.warm ? 'incremental copies' : 'migration';
  return (
    <ConfirmModal
      isOpen={isOpen}
      toggleOpen={toggleOpen}
      mutateFn={mutateFn}
      mutateResult={mutateResult}
      title={`${verb} ${noun}?`}
      body={
        <TextContent>
          <Text>
            {verb} the {noun} for plan &quot;{plan.metadata.name}&quot;?
          </Text>
          <Text>
            {action === 'cutover' || !plan.spec.warm
              ? 'VMs included in the migration plan will be shut down.'
              : 'VM data will be copied incrementally until cutover migration. To start cutover, click the button on the Plans page.'}{' '}
            See the product documentation for more information.
          </Text>
        </TextContent>
      }
      confirmButtonText={action === 'cutover' ? 'Cutover' : verb}
      errorText={`Could not ${verb.toLowerCase()} ${noun}`}
    />
  );
};

export default MigrateOrCutoverConfirmModal;
