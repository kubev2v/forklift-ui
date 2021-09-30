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
              : 'VMs included in the migration plan will remain powered on until cutover is started.'}{' '}
            See the product documentation for more information.
          </Text>
        </TextContent>
      }
      confirmButtonText={verb}
      errorText={`Could not ${verb} ${noun}`}
    />
  );
};

export default MigrateOrCutoverConfirmModal;
