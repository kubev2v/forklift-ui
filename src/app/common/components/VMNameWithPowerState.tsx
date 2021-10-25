import * as React from 'react';
import { Tooltip } from '@patternfly/react-core';
import { SyncAltIcon, OffIcon, UnknownIcon } from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import {
  IRHVVM,
  IVMwareVM,
  SourceInventoryProvider,
  SourceVM,
  IVMStatus,
} from '@app/queries/types';
import { ProviderType } from '@app/common/constants';

interface IVMNameWithPowerState {
  sourceProvider: SourceInventoryProvider | null;
  vm?: SourceVM;
  vmStatus?: IVMStatus;
}

export const getVMPowerState = (providerType: ProviderType | undefined, vm?: SourceVM) => {
  let powerStatus: 'on' | 'off' | 'unknown' = 'unknown';
  if (!vm) return powerStatus;
  switch (providerType) {
    case 'ovirt': {
      if ((vm as IRHVVM).status === 'up') powerStatus = 'on';
      if ((vm as IRHVVM).status === 'down') powerStatus = 'off';
      break;
    }
    case 'vsphere': {
      if ((vm as IVMwareVM).powerState === 'poweredOn') powerStatus = 'on';
      if ((vm as IVMwareVM).powerState === 'poweredOff') powerStatus = 'off';
      break;
    }
    default: {
      powerStatus = 'unknown';
    }
  }
  return powerStatus;
};

export const VMNameWithPowerState: React.FunctionComponent<IVMNameWithPowerState> = ({
  sourceProvider,
  vm,
  vmStatus,
}) => {
  const renderPowerStateIcon = (providerType: ProviderType, vm?: SourceVM) => {
    const powerStatus = getVMPowerState(providerType, vm);

    const tooltipTxt =
      powerStatus === 'on'
        ? 'Powered on'
        : powerStatus === 'off'
        ? 'Powered off'
        : 'Unknown power state';

    return (
      <Tooltip content={tooltipTxt}>
        {powerStatus === 'on' ? (
          <SyncAltIcon className={spacing.mrSm} />
        ) : powerStatus === 'off' ? (
          <OffIcon className={spacing.mrSm} />
        ) : (
          <UnknownIcon className={spacing.mrSm} />
        )}
      </Tooltip>
    );
  };

  const vmName =
    vm?.name || vmStatus?.name || (vmStatus?.id ? `VM not found (id: ${vmStatus?.id})` : '');

  return (
    <>
      {sourceProvider && renderPowerStateIcon(sourceProvider.type, vm)}
      <Tooltip content={vmName}>
        <span tabIndex={0}>{vmName}</span>
      </Tooltip>
    </>
  );
};
