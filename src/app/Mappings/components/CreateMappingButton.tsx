import * as React from 'react';
import { Button, ButtonProps } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import AddTooltip from '@app/common/components/AddTooltip';
import { useHasSufficientProvidersQuery } from '@app/queries';

interface ICreateMappingButtonProps {
  onClick: () => void;
  variant?: ButtonProps['variant'];
  label?: string;
}

const CreateMappingButton: React.FunctionComponent<ICreateMappingButtonProps> = ({
  onClick,
  variant = 'primary',
  label = 'Create mapping',
}: ICreateMappingButtonProps) => {
  const sufficientProvidersQuery = useHasSufficientProvidersQuery();
  const { hasSufficientProviders } = sufficientProvidersQuery;
  return (
    <AddTooltip
      isTooltipEnabled={!hasSufficientProviders}
      content="You must add at least one VMware provider and one OpenShift Virtualization provider in order to create a mapping."
    >
      <div className={`${spacing.mtMd}`}>
        <Button onClick={onClick} isDisabled={!hasSufficientProviders} variant={variant}>
          {label}
        </Button>
      </div>
    </AddTooltip>
  );
};

export default CreateMappingButton;
