import * as React from 'react';
import {
  ResourcesEmptyIcon,
  ResourcesAlmostFullIcon,
  ResourcesFullIcon,
} from '@patternfly/react-icons';
import {
  global_danger_color_100 as dangerColor,
  global_disabled_color_200 as disabledColor,
  global_disabled_color_100 as canceledColor,
  global_info_color_100 as infoColor,
  global_success_color_100 as successColor,
} from '@patternfly/react-tokens';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { StepType } from '@app/common/constants';
import { IVMStatus } from '@app/queries/types';

interface IStepProps {
  vmStatus: IVMStatus;
  type: StepType;
  error?: boolean;
}

// TODO this is mostly redundant with the GetStepTypeIcon component in PipelineSummary. We should refactor.
export const Step: React.FunctionComponent<IStepProps> = ({
  vmStatus,
  type,
  error,
}: IStepProps) => {
  let step: React.ReactElement | null = null;
  if (type === StepType.Full) {
    step = (
      <ResourcesFullIcon
        className={spacing.mlSm}
        height="1em"
        width="1em"
        color={error ? dangerColor.value : successColor.value}
      />
    );
  }
  if (type === StepType.Half) {
    step = (
      <ResourcesAlmostFullIcon
        className={spacing.mlSm}
        height="1em"
        width="1em"
        color={error || vmStatus.error ? dangerColor.value : infoColor.value}
      />
    );
  }
  if (type === StepType.Canceled) {
    step = (
      <ResourcesAlmostFullIcon
        className={spacing.mlSm}
        height="1em"
        width="1em"
        color={error || vmStatus.error ? dangerColor.value : canceledColor.value}
      />
    );
  }
  if (type === StepType.Empty) {
    step = (
      <ResourcesEmptyIcon
        className={spacing.mlSm}
        height="1em"
        width="1em"
        color={disabledColor.value}
      />
    );
  }

  return step;
};
