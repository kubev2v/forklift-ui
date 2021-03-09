import * as React from 'react';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { CheckIcon } from '@patternfly/react-icons';
import alignment from '@patternfly/react-styles/css/utilities/Alignment/alignment';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { ResolvedQuery } from '@app/common/components/ResolvedQuery';
import { useOpenShiftNetworksQuery } from '@app/queries/networks';
import { ICorrelatedProvider, IOpenShiftProvider, POD_NETWORK } from '@app/queries/types';
import { isSameResource } from '@app/queries/helpers';

interface IOpenShiftNetworkListProps {
  provider: ICorrelatedProvider<IOpenShiftProvider>;
}

const OpenShiftNetworkList: React.FunctionComponent<IOpenShiftNetworkListProps> = ({
  provider,
}: IOpenShiftNetworkListProps) => {
  const openshiftNetworksQuery = useOpenShiftNetworksQuery(provider.inventory);
  const networks = [POD_NETWORK, ...openshiftNetworksQuery.data];
  const defaultNetworkName = provider.metadata.annotations
    ? provider.metadata.annotations['forklift.konveyor.io/defaultTransferNetwork']
    : '';
  return (
    <ResolvedQuery result={openshiftNetworksQuery} errorTitle="Error loading networks">
      <TableComposable
        aria-label={`Networks for provider ${provider.metadata.name}`}
        variant="compact"
        borders={false}
      >
        <Thead>
          <Tr>
            <Th className={spacing.pl_4xl}>Name</Th>
            <Th modifier="fitContent">Default migration network</Th>
            <Th />
          </Tr>
        </Thead>
        <Tbody>
          {networks.map((network) => {
            let isDefault = defaultNetworkName === network.name;
            if (isSameResource(network, POD_NETWORK)) {
              isDefault = !defaultNetworkName;
            }
            return (
              <Tr key={network.uid}>
                <Td modifier="fitContent" className={spacing.pl_4xl}>
                  {network.name}
                </Td>
                <Td className={alignment.textAlignCenter}>{isDefault ? <CheckIcon /> : null}</Td>
                <Td />
              </Tr>
            );
          })}
        </Tbody>
      </TableComposable>
    </ResolvedQuery>
  );
};

export default OpenShiftNetworkList;
