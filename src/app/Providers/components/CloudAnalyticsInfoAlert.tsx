import * as React from 'react';
import { Alert, AlertActionCloseButton } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { useLocalStorageContext, LocalStorageKey } from '@app/common/context/LocalStorageContext';
import CloudAnalyticsLink from '@app/common/components/CloudAnalyticsLink';

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
      a complete inventory of your VMWare environment and get recommendations for which VMs are
      suitable to migrate. Start by downloading a provider data file. Then log in to{' '}
      <CloudAnalyticsLink isInline /> and select Migration Analytics.
    </Alert>
  );
};

export default CloudAnalyticsInfoAlert;
