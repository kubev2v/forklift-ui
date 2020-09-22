import * as React from 'react';
import { IMigration, IPlan } from '@app/queries/types';
import { StatusIcon, StatusType } from '@konveyor/lib-ui';
import { Progress, ProgressVariant } from '@patternfly/react-core';

interface IPlanStatusProps {
  plan: IPlan;
  migration: IMigration;
}

const PlanStatus: React.FunctionComponent<IPlanStatusProps> = ({
  plan,
  migration,
}: IPlanStatusProps) => {
  if (plan.status.conditions.every((condition) => condition.type === 'Ready')) {
    return <StatusIcon status={StatusType.Ok} label="Ready" />;
  } else {
    // TODO: This is only a placeholder more status check needs to be done once clarity with statuses.
    const totalVMs = plan.spec.vmList.length;
    const percentVMsDone = totalVMs > 0 ? (migration.status.nbVMsDone * 100) / totalVMs : 0;
    const label = 'Running';

    return (
      <>
        <StatusIcon status={StatusType.Warning} label={label} />
        <Progress
          value={percentVMsDone}
          label={`${migration.status.nbVMsDone} of ${plan.spec.vmList.length} VMs migrated`}
        />
      </>
    );
  }
};

export default PlanStatus;
