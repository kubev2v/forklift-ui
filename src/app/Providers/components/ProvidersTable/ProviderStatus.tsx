import * as React from 'react';
import { Provider } from '@app/Providers/types';
import StatusIcon, { StatusType } from '@app/common/components/StatusIcon';

interface IProviderStatusProps {
  provider: Provider;
}

const ProviderStatus: React.FunctionComponent<IProviderStatusProps> = ({
  provider,
}: IProviderStatusProps) => {
  // TODO check if there are any warning or error conditions and change this
  // TODO probably surface the most severe condition
  if (provider.status.conditions.every((condition) => condition.type === 'Ready')) {
    return (
      <>
        <StatusIcon status={StatusType.Ok} /> Ready
      </>
    );
  }
  return null;
};

export default ProviderStatus;
