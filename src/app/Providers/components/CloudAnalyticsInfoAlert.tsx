import * as React from 'react';
import { Alert, AlertActionCloseButton, Button } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { useLocalStorageContext, LocalStorageKey } from '@app/common/context/LocalStorageContext';
import { CLOUD_MA_LINK } from '@app/common/constants';

const CloudAnalyticsInfoAlert: React.FunctionComponent = () => {
  const [isAlertHidden, setIsAlertHidden] = useLocalStorageContext(
    LocalStorageKey.isProvidersPageMAAlertHidden
  );

  const link = (
    <Button variant="link" href={CLOUD_MA_LINK.href} isInline>
      {CLOUD_MA_LINK.label}
    </Button>
  );

  const alertMessage = (
    <>
      You can analyze your VMware provider data with Migration Analytics. Migration Analytics
      generates a complete inventory of your VMware environment and VM recommendations for
      migration. Select your VMware providers and download the data file. Then log in to {link},
      select Migration Analytics, and create a Migration Analytics report.
    </>
  );

  return isAlertHidden ? null : (
    <Alert
      variant="info"
      title="Analyze provider data"
      actionClose={<AlertActionCloseButton onClose={() => setIsAlertHidden('true')} />}
      className={spacing.mtMd}
    >
      {alertMessage}
    </Alert>
  );
};

export default CloudAnalyticsInfoAlert;
