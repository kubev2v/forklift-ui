import * as React from 'react';
import { IVMwareVM } from '@app/queries/types';
import { StatusIcon, StatusType } from '@konveyor/lib-ui';
import { InfoCircleIcon } from '@patternfly/react-icons';
import { getMostSevereVMConcern } from './helpers';

interface IVMConcernsIconProps {
  vm: IVMwareVM;
}

const VMConcernsIcon: React.FunctionComponent<IVMConcernsIconProps> = ({
  vm,
}: IVMConcernsIconProps) => {
  const worstConcern = getMostSevereVMConcern(vm);
  if (!worstConcern) {
    return <StatusIcon status={StatusType.Ok} label="Ok" />;
  }
  if (worstConcern.severity === 'Critical') {
    return <StatusIcon status={StatusType.Error} label="Critical" />;
  }
  if (worstConcern.severity === 'Warning') {
    return <StatusIcon status={StatusType.Warning} label="Warning" />;
  }
  if (worstConcern.severity === 'Advisory' || worstConcern.severity === 'Info') {
    // TODO we should add an Info status type to StatusIcon
    return (
      <>
        <InfoCircleIcon />
        &nbsp;Advisory
      </>
    );
  }
  return null;
};

export default VMConcernsIcon;
