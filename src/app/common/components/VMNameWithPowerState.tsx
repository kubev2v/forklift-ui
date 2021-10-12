import * as React from 'react';
import { Tooltip } from '@patternfly/react-core';
import { SyncAltIcon, OffIcon, UnknownIcon } from '@patternfly/react-icons';
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
    let powerStatus: 'on' | 'off' | 'unknown';

    switch (providerType) {
      case 'ovirt': {
        powerStatus = (vm as IRHVVM).status === 'up' ? 'on' : 'off';
        break;
      }
      case 'vsphere': {
        powerStatus = (vm as IVMwareVM).powerState === 'poweredOn' ? 'on' : 'off';
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
          <SyncAltIcon className="pf-u-mr-xs" />
        ) : powerStatus === 'off' ? (
          <OffIcon className="pf-u-mr-xs" />
        ) : (
          <UnknownIcon className="pf-u-mr-xs" />
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
