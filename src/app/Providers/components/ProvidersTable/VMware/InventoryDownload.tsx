import * as React from 'react';
import { LevelItem, Text } from '@patternfly/react-core';
import { useQuery } from 'react-query';
import { useAuthorizedFetch } from '@app/queries/fetchHelpers';
import { VIRT_META } from '@app/common/constants';
import { IVMwareProvider } from '@app/queries/types';

interface IInventoryDowloadProps {
  providers: IVMwareProvider[];
}

const InventoryDownload: React.FunctionComponent<IInventoryDowloadProps> = ({ providers }) => {
  const useDownload = () => {
    return useQuery({
      queryKey: ['payload'],
      queryFn: useAuthorizedFetch(
        `${VIRT_META.inventoryPayloadApi}/api/v1/extract?providers=` +
          providers.map((provider) => `${provider.name},`),
        true
      ),
      config: {},
    });
  };

  const { status, error } = useDownload();
  if (status === 'loading')
    return (
      <LevelItem>
        <Text>Loading inventory download</Text>
      </LevelItem>
    );
  else if (status === 'error') {
    console.log('Inventory Download Error: ', error);
    return (
      <LevelItem>
        <Text>Error inventory download</Text>
      </LevelItem>
    );
  } else
    return (
      <LevelItem>
        <Text>Inventory download Success</Text>
      </LevelItem>
    );
};

export default InventoryDownload;
