import * as React from 'react';
import {
  Title,
  EmptyState,
  Card,
  CardBody,
  EmptyStateIcon,
  EmptyStateBody,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { Mapping, MappingType } from '@app/queries/types';
import { PlusCircleIcon } from '@patternfly/react-icons';
import MappingsTable from './components/MappingsTable';
import {
  filterSharedMappings,
  useClusterProvidersQuery,
  useHasSufficientProvidersQuery,
  useMappingsQuery,
} from '@app/queries';
import CreateMappingButton from './components/CreateMappingButton';
import { ResolvedQueries } from '@app/common/components/ResolvedQuery';

interface IMappingsProps {
  mappingType: MappingType;
  toggleModalAndResetEdit: () => void;
  openEditMappingModal: (mapping: Mapping) => void;
}

const Mappings: React.FunctionComponent<IMappingsProps> = ({
  mappingType,
  toggleModalAndResetEdit,
  openEditMappingModal,
}: IMappingsProps) => {
  const sufficientProvidersQuery = useHasSufficientProvidersQuery();
  const clusterProvidersQuery = useClusterProvidersQuery();
  const mappingsQuery = useMappingsQuery(mappingType);
  const filteredMappings = filterSharedMappings(mappingsQuery.data?.items);

  return (
    <ResolvedQueries
      results={[sufficientProvidersQuery.result, clusterProvidersQuery, mappingsQuery]}
      errorTitles={[
        'Could not load provider inventory data',
        'Could not load providers from cluster',
        'Could not load mappings',
      ]}
      errorsInline={false}
    >
      <Card>
        <CardBody>
          {!filteredMappings ? null : filteredMappings.length === 0 ? (
            <EmptyState className={spacing.my_2xl}>
              <EmptyStateIcon icon={PlusCircleIcon} />
              <Title headingLevel="h2" size="lg">
                No {mappingType.toLowerCase()} mappings
              </Title>
              <EmptyStateBody>
                {mappingType === MappingType.Network
                  ? 'Map source provider networks to target provider networks.'
                  : 'Map source provider datastores or storage domains to target provider storage classes.'}
              </EmptyStateBody>
              <CreateMappingButton onClick={toggleModalAndResetEdit} />
            </EmptyState>
          ) : (
            <MappingsTable
              mappings={filteredMappings || []}
              mappingType={mappingType}
              openEditMappingModal={openEditMappingModal}
            />
          )}
        </CardBody>
      </Card>
    </ResolvedQueries>
  );
};
export default Mappings;
