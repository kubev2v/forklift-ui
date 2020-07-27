import * as React from 'react';
import { Button, ButtonProps } from '@patternfly/react-core';

// TODO add proper URL, determine if it needs to open in a new tab

const CloudAnalyticsLink: React.FunctionComponent<ButtonProps> = (props: ButtonProps) => (
  <Button variant="link" onClick={() => alert('TODO')} {...props}>
    cloud.redhat.com
  </Button>
);

export default CloudAnalyticsLink;
