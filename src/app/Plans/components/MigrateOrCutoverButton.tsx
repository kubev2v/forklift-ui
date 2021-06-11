import * as React from 'react';
import { createPortal } from 'react-dom';
import { useHistory } from 'react-router-dom';
import { Button, Spinner } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { useCreateMigrationMutation, useSetCutoverMutation } from '@app/queries';
import { IMigration } from '@app/queries/types/migrations.types';
import { IPlan } from '@app/queries/types';
import { PlanActionButtonType } from './PlansTable';
import { ResolvedQuery, QuerySpinnerMode } from '@app/common/components/ResolvedQuery';

interface IMigrateOrCutoverButtonProps {
  plan: IPlan;
  buttonType: PlanActionButtonType;
  isBeingStarted: boolean;
  errorContainerRef: React.RefObject<HTMLDivElement>;
}

const MigrateOrCutoverButton: React.FunctionComponent<IMigrateOrCutoverButtonProps> = ({
  plan,
  buttonType,
  isBeingStarted,
  errorContainerRef,
}: IMigrateOrCutoverButtonProps) => {
  const history = useHistory();
  const onMigrationStarted = (migration: IMigration) => {
    history.push(`/plans/${migration.spec.plan.name}`);
  };
  const createMigrationMutationResult = useCreateMigrationMutation(onMigrationStarted);
  const { mutate: createMigration } = createMigrationMutationResult;

  const setCutoverMutationResult = useSetCutoverMutation();
  const { mutate: setCutover } = setCutoverMutationResult;

  if (
    isBeingStarted ||
    createMigrationMutationResult.isLoading ||
    setCutoverMutationResult.isLoading
  ) {
    return <Spinner size="md" className={spacing.mxLg} />;
  }
  return (
    <>
      <Button
        variant="secondary"
        onClick={() => {
          if (buttonType === 'Start' || buttonType === 'Restart') {
            createMigration(plan);
          } else if (buttonType === 'Cutover') {
            setCutover({ plan, cutover: new Date().toISOString() });
          }
        }}
      >
        {buttonType}
      </Button>
      {(createMigrationMutationResult.isError || setCutoverMutationResult.isError) &&
      errorContainerRef.current
        ? createPortal(
            <>
              <ResolvedQuery
                result={createMigrationMutationResult}
                errorTitle="Error starting migration"
                errorsInline={false}
                spinnerMode={QuerySpinnerMode.None}
                className={spacing.mbMd}
              />
              <ResolvedQuery
                result={setCutoverMutationResult}
                errorTitle="Error setting cutover time"
                errorsInline={false}
                spinnerMode={QuerySpinnerMode.None}
                className={spacing.mbMd}
              />
            </>,
            errorContainerRef.current
          )
        : null}
    </>
  );
};

export default MigrateOrCutoverButton;
