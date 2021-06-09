import * as React from 'react';
import { Button, ButtonProps } from '@patternfly/react-core';
import ConditionalTooltip from '@app/common/components/ConditionalTooltip';
import { useHasSufficientProvidersQuery } from '@app/queries';
import { useHistory } from 'react-router-dom';

interface ICreatePlanButtonProps {
  variant?: ButtonProps['variant'];
}

const CreatePlanButton: React.FunctionComponent<ICreatePlanButtonProps> = ({
  variant = 'primary',
}: ICreatePlanButtonProps) => {
  const sufficientProvidersQuery = useHasSufficientProvidersQuery();
  const { hasSufficientProviders } = sufficientProvidersQuery;
  const history = useHistory();
  return (
    <ConditionalTooltip
      isTooltipEnabled={!hasSufficientProviders}
      content="You must add at least one VMware provider and one OpenShift Virtualization provider in order to create a migration plan."
    >
      <Button
        isSmall
        onClick={() => history.push('/plans/create')}
        isDisabled={!hasSufficientProviders}
        variant={variant}
        id="create-plan-button"
      >
        Create plan
      </Button>
    </ConditionalTooltip>
  );
};

export default CreatePlanButton;
