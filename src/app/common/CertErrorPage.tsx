import * as React from 'react';
import { Card, CardBody, Alert } from '@patternfly/react-core';
import { useOAuthContext } from './context';
import { useHistory } from 'react-router-dom';

export interface ICertErrorMatchParams {
  url: string;
}

const CertErrorPage: React.FunctionComponent = () => {
  const history = useHistory();
  const { failedUrl } = useOAuthContext();
  if (!failedUrl) {
    history.push('/');
  }
  return (
    <>
      {failedUrl ? (
        <Card>
          <CardBody>
            <Alert title="Certificate error">
              A certificate error has occurred, likely due to the usage of self signed certificates
              in one of the clusters. Please try to visit the failed url and accept the CA:
              <a href={failedUrl}> {failedUrl}</a>
              <div />
              The correct way to address this is to install your self CA into your browser.
              <div />
              NOTE: The contents of the resulting page may report "unauthorized". This is expected.
              After accepting the certificate, please reload the app.
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
