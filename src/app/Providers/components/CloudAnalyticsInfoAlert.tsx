import * as React from 'react';
import { Alert, AlertActionCloseButton, Button } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { useLocalStorageContext, LocalStorageKey } from '@app/common/context/LocalStorageContext';
import { CLOUD_MA_LINK } from '@app/common/constants';

const CloudAnalyticsInfoAlert: React.FunctionComponent = () => {
  const [isAlertHidden, setIsAlertHidden] = useLocalStorageContext(
    LocalStorageKey.isProvidersPageMAAlertHidden
  );
  if (isAlertHidden) return null;
  return (
    <Alert
      variant="info"
      title="Analyze provider data"
      actionClose={<AlertActionCloseButton onClose={() => setIsAlertHidden('true')} />}
      className={spacing.mtMd}
    >
      You can upload your VMware provider data to Red Hat&apos;s Migration Analytics service to see
      a complete inventory of your VMware environment and get recommendations for which VMs are
      suitable to migrate. Start by downloading a provider data file. Then log in to{' '}
      <Button variant="link" href={CLOUD_MA_LINK.href} isInline>
        {CLOUD_MA_LINK.label}
      </Button>{' '}
      and select Migration Analytics.
    </Alert>
  );
};

export default CloudAnalyticsInfoAlert;
