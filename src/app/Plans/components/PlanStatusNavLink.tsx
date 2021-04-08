import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { Button } from '@patternfly/react-core';
import { IPlan } from '@app/queries/types';

interface IPlanStatusNavLinkProps {
  plan: IPlan;
  isInline?: boolean;
  children: React.ReactNode;
}

const PlanStatusNavLink: React.FunctionComponent<IPlanStatusNavLinkProps> = ({
  plan,
  isInline = true,
  children,
}: IPlanStatusNavLinkProps) => {
  const history = useHistory();
  return (
    <Button
      variant="link"
      onClick={() => history.push(`/plans/${plan.metadata.name}`)}
      isInline={isInline}
      className={!isInline ? 'clickable-progress-bar' : ''}
    >
      {children}
    </Button>
  );
};

export default PlanStatusNavLink;
