import * as React from 'react';
import { Provider } from '@app/queries/types';
import { StatusIcon, StatusType } from '@konveyor/lib-ui';
import { mostSeriousCondition } from '@app/common/helpers';
import { StatusCategoryType, PlanStatusAPIType } from '@app/common/constants';

interface IProviderStatusProps {
  provider: Provider;
}

const ProviderStatus: React.FunctionComponent<IProviderStatusProps> = ({
  provider,
}: IProviderStatusProps) => {
  const setStatusType = () => {
    if (provider.object.status) {
      if (mostSeriousCondition(provider.object.status?.conditions) === PlanStatusAPIType.Ready) {
        return StatusType.Ok;
      } else if (
        mostSeriousCondition(provider.object.status?.conditions) === StatusCategoryType.Critical ||
        mostSeriousCondition(provider.object.status?.conditions) === StatusCategoryType.Error
      ) {
        return StatusType.Error;
      }
    }
    return StatusType.Warning;
  };

  if (provider.object.status) {
    return (
      <StatusIcon
        status={setStatusType()}
        label={mostSeriousCondition(provider.object.status?.conditions)}
      />
    );
  } else return null;
};

export default ProviderStatus;
