import * as React from 'react';
import { IVMwareVM } from '@app/queries/types';
import { StatusIcon, StatusType } from '@konveyor/lib-ui';
import { InfoCircleIcon } from '@patternfly/react-icons';
import { Flex, FlexItem, Spinner } from '@patternfly/react-core';
import './VMConcernsIcon.css';

import { getMostSevereVMConcern } from './helpers';
interface IVMConcernsIconProps {
  vm: IVMwareVM;
}

const VMConcernsIcon: React.FunctionComponent<IVMConcernsIconProps> = ({
  vm,
}: IVMConcernsIconProps) => {
  if (vm.revisionAnalyzed < vm.revision) {
    return (
      <Flex spaceItems={{ default: 'spaceItemsSm' }}>
        <FlexItem>
          <Spinner aria-valuetext="Analysing" size="sm" className="spinner" />
        </FlexItem>
        <FlexItem>Analysing</FlexItem>
      </Flex>
    );
  }

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
  if (worstConcern.severity === 'Info') {
    return <StatusIcon status={StatusType.Info} label="Info" />;
  }
  if (worstConcern.severity === 'Advisory') {
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
