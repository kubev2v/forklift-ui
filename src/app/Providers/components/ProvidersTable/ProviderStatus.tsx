import * as React from 'react';
import { Provider } from '@app/queries/types';
import { StatusIcon, StatusType } from '@konveyor/lib-ui';

interface IProviderStatusProps {
  provider: Provider;
}

const ProviderStatus: React.FunctionComponent<IProviderStatusProps> = ({
  provider,
}: IProviderStatusProps) => {
  // TODO check if there are any warning or error conditions and change this
  // TODO probably surface the most severe condition
  if (provider.status.conditions.every((condition) => condition.type === 'Ready')) {
    return <StatusIcon status={StatusType.Ok} label="Ready" />;
  }
  return null;
};

export default ProviderStatus;
