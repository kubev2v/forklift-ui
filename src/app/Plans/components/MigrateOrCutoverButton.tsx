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
  const createMigrationMutation = useCreateMigrationMutation(onMigrationStarted);
  const setCutoverMutation = useSetCutoverMutation();

  if (isBeingStarted || createMigrationMutation.isLoading || setCutoverMutation.isLoading) {
    return <Spinner size="md" className={spacing.mxLg} />;
  }
  return (
    <>
      <Button
        variant="secondary"
        onClick={() => {
          if (buttonType === 'Start' || buttonType === 'Restart') {
            createMigrationMutation.mutate(plan);
          } else if (buttonType === 'Cutover') {
            setCutoverMutation.mutate({ plan, cutover: new Date().toISOString() });
          }
        }}
      >
        {buttonType}
      </Button>
      {(createMigrationMutation.isError || setCutoverMutation.isError) && errorContainerRef.current
        ? createPortal(
            <>
              <ResolvedQuery
                result={createMigrationMutation}
                errorTitle="Could not start migration"
                errorsInline={false}
                spinnerMode={QuerySpinnerMode.None}
                className={spacing.mbMd}
              />
              <ResolvedQuery
                result={setCutoverMutation}
                errorTitle="Could not set cutover time"
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
