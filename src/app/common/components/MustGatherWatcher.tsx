import * as React from 'react';
import { Button } from '@patternfly/react-core';
import { NotificationContext } from '@app/common/context';
import { useMustGatherQuery } from '@app/queries';
import { mustGatherStatus } from '@app/client/types';
import { getMustGatherApiUrl } from '@app/queries/helpers';
import { MustGatherContext } from '@app/common/context';
import { authorizedFetch, useFetchContext } from '@app/queries/fetchHelpers';

interface IMustGatherWatcherProps {
  name: string;
  listStatus: mustGatherStatus;
}

export const MustGatherWatcher: React.FunctionComponent<IMustGatherWatcherProps> = ({
  name,
  listStatus,
}: IMustGatherWatcherProps) => {
  const { pushNotification } = React.useContext(NotificationContext);
  const completedPreviously = listStatus === 'completed';
  const erroredPreviously = listStatus === 'error';
  const [notified, setNotified] = React.useState(completedPreviously || erroredPreviously);
  const [hasCompleted, setHasCompleted] = React.useState(completedPreviously || erroredPreviously);
  const { data, isSuccess } = useMustGatherQuery(name, hasCompleted);
  const { withoutNs } = React.useContext(MustGatherContext);
  const fetchContext = useFetchContext();

  React.useEffect(() => {
    const type = data?.command.toLowerCase().includes('plan') ? 'plan' : 'vm';
    const unprefixedName = data && withoutNs(data['custom-name'], type);
    if (
      data?.status === 'completed' ||
      completedPreviously ||
      data?.status === 'error' ||
      erroredPreviously
    ) {
      setHasCompleted(true);
    } else {
      setHasCompleted(false);
    }

    if (isSuccess && !!data?.['custom-name'] && listStatus === 'completed' && !notified) {
      pushNotification({
        title: 'Log collection complete.',
        message: (
          <div>
            You can download the migration logs for the {type}&nbsp;
            <Button
              onClick={() => {
                authorizedFetch<Blob>(
                  getMustGatherApiUrl(`must-gather/${data?.['id']}/data`),
                  fetchContext,
                  {},
                  'get',
                  'blob'
                )
                  .then((tarBall) => {
                    const file = new File(
                      [tarBall],
                      `must-gather-${data?.['custom-name']}.tar.gz`,
                      { type: 'text/plain;charset=utf-8' }
                    );
                    saveAs(file);
                  })
                  .catch((error) => {
                    console.error(error);
                  });
              }}
              variant="link"
              isInline
            >
              {unprefixedName}
            </Button>
          </div>
        ),
        key: `${data?.['custom-name']}-completed`,
        variant: 'success',
        actionClose: true,
        timeout: false,
      });

      setNotified(true);
    }

    if (isSuccess && !!data?.['custom-name'] && listStatus === 'error' && !notified) {
      pushNotification({
        title: 'Log collection unsuccessful.',
        message: `An error was encountered while gathering the migration logs for the ${type} ${unprefixedName}`,
        key: `${data?.['custom-name']}-error`,
        variant: 'danger',
        actionClose: true,
        timeout: false,
      });

      setNotified(true);
    }
  }, [
    data,
    isSuccess,
    notified,
    listStatus,
    hasCompleted,
    completedPreviously,
    erroredPreviously,
    fetchContext,
    withoutNs,
    setNotified,
    setHasCompleted,
    pushNotification,
  ]);

  return null;
};
