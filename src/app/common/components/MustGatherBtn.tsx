import * as React from 'react';
import { Button, Tooltip } from '@patternfly/react-core';
import { WarningTriangleIcon } from '@patternfly/react-icons';
import { MustGatherContext } from '@app/common/context';
import { getMustGatherApiUrl } from '@app/queries/helpers';

interface IMustGatherBtn {
  customName: string;
  type: 'plan' | 'vm';
}

export const MustGatherBtn: React.FunctionComponent<IMustGatherBtn> = ({ customName, type }) => {
  const {
    setMustGatherModalOpen,
    setActiveMustGather,
    mustGatherWatchList,
    setMustGatherWatchList,
    mustGathersQuery,
    latestAssociatedMustGather,
  } = React.useContext(MustGatherContext);

  const mustGather = latestAssociatedMustGather(customName);

  return mustGather?.status === 'completed' && mustGather?.['archive-name'] ? (
    <Tooltip
      content={
        !mustGathersQuery.isSuccess
          ? `Could not reach must gather service.`
          : `${mustGather?.['archive-name']} available for download`
      }
    >
      <Button
        isAriaDisabled={!mustGathersQuery.isSuccess}
        variant="secondary"
        component="a"
        target="_blank"
        download
        href={getMustGatherApiUrl(`must-gather/${mustGather?.['id']}/data`)}
      >
        Download logs
      </Button>
    </Tooltip>
  ) : (
    <Tooltip
      content={
        !mustGathersQuery.isSuccess
          ? `Could not reach must gather service.`
          : mustGather?.status === 'inprogress'
          ? `Collecting ${type === 'plan' ? 'migration plan' : 'VM migration'} logs.`
          : mustGather?.status === 'new'
          ? `Must gather queued for execution.`
          : mustGather?.status === 'error'
          ? `Could not complete must gather for ${mustGather?.['custom-name']}`
          : `Collects the current ${
              type === 'plan' ? 'migration plan' : 'VM migration'
            } logs and creates a tar archive file for download.`
      }
    >
      <Button
        icon={mustGather?.status === 'error' ? <WarningTriangleIcon /> : null}
        isLoading={
          mustGatherWatchList.map((mg) => mg.name).includes(customName) &&
          !mustGathersQuery.isError &&
          (mustGather?.status === 'inprogress' || mustGather?.status === 'new')
        }
        isAriaDisabled={
          (mustGatherWatchList.map((mg) => mg.name).includes(customName) &&
            (mustGather?.status === 'inprogress' || mustGather?.status === 'new')) ||
          !mustGathersQuery.isSuccess
        }
        variant="secondary"
        onClick={() => {
          setMustGatherModalOpen(true);
          setActiveMustGather({
            type,
            customName: customName,
            status: 'new',
          });

          setMustGatherWatchList([
            ...mustGatherWatchList,
            {
              name: customName,
              // ensure the "inprogress" state is reflected in the button
              isGathering: true,
            },
          ]);
        }}
      >
        {mustGather?.status === 'completed' ? 'Download logs' : 'Get logs'}
      </Button>
    </Tooltip>
  );
};
