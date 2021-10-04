import * as React from 'react';
import ConfirmModal, { IConfirmModalProps } from '@app/common/components/ConfirmModal';
import { IPlan } from '@app/queries/types';
import { TextContent, Text } from '@patternfly/react-core';

interface IMigrateOrCutoverConfirmModalProps
  extends Pick<IConfirmModalProps, 'isOpen' | 'toggleOpen' | 'mutateResult'> {
  plan: IPlan;
  action: 'start' | 'restart' | 'cutover';
  doMigrateOrCutover: (cutover?: string) => void;
}

const MigrateOrCutoverConfirmModal: React.FunctionComponent<IMigrateOrCutoverConfirmModalProps> = ({
  isOpen,
  toggleOpen,
  doMigrateOrCutover,
  mutateResult,
  plan,
  action,
}: IMigrateOrCutoverConfirmModalProps) => {
  const verb = action === 'restart' ? 'Restart' : 'Start';
  const noun =
    action === 'cutover' ? 'cutover' : plan.spec.warm ? 'incremental copies' : 'migration';

  const [cutoverScheduleMode, setCutoverScheduleMode] = React.useState<'now' | 'later'>('now');
  const [cutoverTime, setCutoverTime] = React.useState<null | string>(null);

  // TODO if action === 'cutover', render the options, change the button text and pass cutoverTime into doMigrateOrCutover

  return (
    <ConfirmModal
      isOpen={isOpen}
      toggleOpen={toggleOpen}
      mutateFn={() => doMigrateOrCutover()}
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
