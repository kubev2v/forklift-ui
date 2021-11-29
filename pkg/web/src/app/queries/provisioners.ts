import { ForkliftResource, ForkliftResourceKind } from '@app/client/helpers';
import { IKubeList } from '@app/client/types';
import { META } from '@app/common/constants';
import { usePollingContext } from '@app/common/context';
import { useAuthorizedK8sClient } from './fetchHelpers';
import { mockKubeList, useMockableQuery } from './helpers';
import { IProvisioner } from './types';
import { MOCK_PROVISIONERS } from './mocks/provisioners.mock';

const provisionerResource = new ForkliftResource(ForkliftResourceKind.Provisioners, META.namespace);

export const useProvisionersQuery = () => {
  const client = useAuthorizedK8sClient();
  return useMockableQuery<IKubeList<IProvisioner>>(
    {
      queryKey: 'provisioners',
      queryFn: async () => (await client.list<IKubeList<IProvisioner>>(provisionerResource)).data,
      refetchInterval: usePollingContext().refetchInterval,
    },
    mockKubeList(MOCK_PROVISIONERS, 'Provisioner')
  );
};
