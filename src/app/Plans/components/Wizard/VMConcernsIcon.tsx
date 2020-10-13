import * as React from 'react';
import { IVMwareVM } from '@app/queries/types';
import { StatusIcon, StatusType } from '@konveyor/lib-ui';
import { InfoCircleIcon } from '@patternfly/react-icons';

interface IVMConcernsIconProps {
  vm: IVMwareVM;
}

const VMConcernsIcon: React.FunctionComponent<IVMConcernsIconProps> = ({
  vm,
}: IVMConcernsIconProps) => {
  if (!vm.concerns || vm.concerns.length === 0) {
    return <StatusIcon status={StatusType.Ok} label="Ok" />;
  }
  if (vm.concerns.some((concern) => concern.severity === 'Critical')) {
    return <StatusIcon status={StatusType.Error} label="Error" />;
  }
  if (
    !vm.concerns.some((concern) => concern.severity === 'Warning') &&
    vm.concerns.some((concern) => concern.severity === 'Info' || concern.severity === 'Advisory')
  ) {
    // TODO we should add an Info status type to StatusIcon
    return (
      <>
        <InfoCircleIcon />
        &nbsp;Advisory
      </>
    );
  }
  return <StatusIcon status={StatusType.Warning} label="Warning" />;
};

export default VMConcernsIcon;
