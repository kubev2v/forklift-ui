import * as React from 'react';
import { Alert, PageSection } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { useHistory } from 'react-router-dom';
import { useNetworkContext } from './context/NetworkContext';

const CertErrorPage: React.FunctionComponent = () => {
  const history = useHistory();
  const { selfSignedCertUrl } = useNetworkContext();
  if (!selfSignedCertUrl) {
    history.push('/');
  }
  return (
    <PageSection variant="light">
      {selfSignedCertUrl ? (
        <Alert title="Certificate error" className={spacing.mMd}>
          A certificate error has occurred, likely due to the usage of self signed certificates in
          one of the clusters.
          <br />
          <br />
          Please try to visit the failed url and accept the CA:
          <br />
          <a href={selfSignedCertUrl}> {selfSignedCertUrl}</a>
          <br />
          <br />
          The correct way to address this is to install your self CA into your browser.
          <br />
          <br />
          NOTE: The contents of the resulting page may report &quot;unauthorized&quot; This is
          expected. After accepting the certificate, please reload the app.
        </Alert>
      ) : (
        <div />
      )}
    </PageSection>
  );
};

export default CertErrorPage;
