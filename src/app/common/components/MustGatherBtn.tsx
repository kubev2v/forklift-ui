import * as React from 'react';
import { Button, Tooltip } from '@patternfly/react-core';
import { WarningTriangleIcon } from '@patternfly/react-icons';
import { MustGatherContext } from '@app/common/context';
import { getMustGatherApiUrl } from '@app/queries/helpers';
import { authorizedFetch, useFetchContext } from '@app/queries/fetchHelpers';
import { saveAs } from 'file-saver';

interface IMustGatherBtn {
  displayName: string;
  type: 'plan' | 'vm';
}

export const MustGatherBtn: React.FunctionComponent<IMustGatherBtn> = ({ displayName, type }) => {
  const {
    setMustGatherModalOpen,
    setActiveMustGather,
    mustGathersQuery,
    latestAssociatedMustGather,
    withNs,
    withoutNs,
  } = React.useContext(MustGatherContext);

  const namespacedName = withNs(displayName, type);
  const mustGather = latestAssociatedMustGather(namespacedName);
  const fetchContext = useFetchContext();

  return mustGather?.status === 'completed' && mustGather?.['archive-name'] ? (
    <Tooltip
      content={
        !mustGathersQuery.isSuccess
          ? `Could not reach must gather service.`
          : `must-gather-${type}_${displayName} available for download.`
      }
    >
      <Button
        aria-label={`Download logs for ${displayName}`}
        isAriaDisabled={!mustGathersQuery.isSuccess}
        variant="secondary"
        onClick={() => {
          authorizedFetch<Blob>(
            getMustGatherApiUrl(`must-gather/${mustGather?.['id']}/data`),
            fetchContext,
            {},
            'get',
            'blob'
          )
            .then((tarBall) => {
              const file = new File([tarBall], mustGather['archive-name'], {
                type: 'text/plain;charset=utf-8',
              });
              saveAs(file);
            })
            .catch((error) => {
              console.error(error);
            });
        }}
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
          ? `Could not complete must gather for ${withoutNs(mustGather?.['custom-name'], type)}`
          : `Collects the current ${
              type === 'plan' ? 'migration plan' : 'VM migration'
            } logs and creates a tar archive file for download.`
      }
    >
      <Button
        icon={mustGather?.status === 'error' ? <WarningTriangleIcon /> : null}
        isLoading={
          !mustGathersQuery.isError &&
          (mustGather?.status === 'inprogress' || mustGather?.status === 'new')
        }
        isAriaDisabled={
          mustGather?.status === 'inprogress' ||
          mustGather?.status === 'new' ||
          !mustGathersQuery.isSuccess
        }
        variant="secondary"
        onClick={() => {
          setMustGatherModalOpen(true);
          setActiveMustGather({
            type,
            displayName: displayName,
            status: 'new',
          });
        }}
      >
        {mustGather?.status === 'completed' ? 'Download logs' : 'Get logs'}
      </Button>
    </Tooltip>
  );
};
