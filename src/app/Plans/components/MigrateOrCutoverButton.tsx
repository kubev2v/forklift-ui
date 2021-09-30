import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Spinner } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { useCreateMigrationMutation, useSetCutoverMutation } from '@app/queries';
import { IPlan } from '@app/queries/types';
import { PlanActionButtonType } from './PlansTable';
import MigrateOrCutoverConfirmModal from './MigrateOrCutoverConfirmModal';

interface IMigrateOrCutoverButtonProps {
  plan: IPlan;
  buttonType: PlanActionButtonType;
  isBeingStarted: boolean;
}

const MigrateOrCutoverButton: React.FunctionComponent<IMigrateOrCutoverButtonProps> = ({
  plan,
  buttonType,
  isBeingStarted,
}: IMigrateOrCutoverButtonProps) => {
  const history = useHistory();
  const onMigrationStarted = () => {
    toggleConfirmModal();
    history.push(`/plans/${plan.metadata.name}`);
  };
  const createMigrationMutation = useCreateMigrationMutation(onMigrationStarted);
  const setCutoverMutation = useSetCutoverMutation(onMigrationStarted);

  const [isConfirmModalOpen, toggleConfirmModal] = React.useReducer((isOpen) => !isOpen, false);

  const doMigrateOrCutover = () => {
    if (buttonType === 'Start') {
      createMigrationMutation.mutate(plan);
    } else if (buttonType === 'Cutover') {
      setCutoverMutation.mutate({ plan, cutover: new Date().toISOString() });
    }
  };

  return (
    <>
      {isBeingStarted ? (
        <Spinner size="md" className={spacing.mxLg} />
      ) : (
        <Button variant="secondary" onClick={toggleConfirmModal}>
          {buttonType}
        </Button>
      )}
      <MigrateOrCutoverConfirmModal
        isOpen={isConfirmModalOpen}
        toggleOpen={toggleConfirmModal}
        mutateFn={doMigrateOrCutover}
        mutateResult={buttonType === 'Start' ? createMigrationMutation : setCutoverMutation}
        plan={plan}
        action={buttonType === 'Start' ? 'start' : 'cutover'}
      />
    </>
  );
};

export default MigrateOrCutoverButton;
