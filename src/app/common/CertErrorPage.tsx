import * as React from 'react';
import { Card, CardBody, Alert } from '@patternfly/react-core';
import { useHistory } from 'react-router-dom';
import { useNetworkContext } from './context/NetworkContext';

const CertErrorPage: React.FunctionComponent = () => {
  const history = useHistory();
  const { selfSignedCertUrl } = useNetworkContext();
  if (!selfSignedCertUrl) {
    history.push('/');
  }
  return (
    <>
      {selfSignedCertUrl ? (
        <Card>
          <CardBody>
            <Alert title="Certificate error">
              A certificate error has occurred, likely due to the usage of self signed certificates
              in one of the clusters. Please try to visit the failed url and accept the CA:
              <a href={selfSignedCertUrl}> {selfSignedCertUrl}</a>
              <div />
              The correct way to address this is to install your self CA into your browser.
              <div />
              NOTE: The contents of the resulting page may report &quot;unauthorized&quot; This is
              expected. After accepting the certificate, please reload the app.
            </Alert>
          </CardBody>
        </Card>
      ) : (
        <div />
      )}
    </>
  );
};

export default CertErrorPage;
