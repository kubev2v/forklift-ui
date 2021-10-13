import * as React from 'react';
import { Tooltip } from '@patternfly/react-core';
import { SyncAltIcon, OffIcon, UnknownIcon } from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { IRHVVM, IVMwareVM, SourceInventoryProvider, SourceVM } from '@app/queries/types';
import { PROVIDER_TYPE_NAMES } from '@app/common/constants';

interface IVMNameWithPowerState {
  sourceProvider: SourceInventoryProvider | null;
  vm: SourceVM;
}

export const VMNameWithPowerState: React.FunctionComponent<IVMNameWithPowerState> = ({
  sourceProvider,
  vm,
}) => {
  const renderPowerStateIcon = (providerType: keyof typeof PROVIDER_TYPE_NAMES, vm: SourceVM) => {
    let powerStatus: 'on' | 'off' | 'unknown' = 'unknown';

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

  return (
    <>
      {sourceProvider && renderPowerStateIcon(sourceProvider.type, vm)}
      <Tooltip content={vm.name}>
        <span tabIndex={0}>{vm.name}</span>
      </Tooltip>
    </>
  );
};
