import * as React from 'react';
import {
  PageSection,
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
import AddEditMappingModal from './components/AddEditMappingModal';
import {
  filterSharedMappings,
  useClusterProvidersQuery,
  useHasSufficientProvidersQuery,
  useMappingsQuery,
} from '@app/queries';
import CreateMappingButton from './components/CreateMappingButton';
import { ResolvedQueries } from '@app/common/components/ResolvedQuery';

interface IMappingsPageProps {
  mappingType: MappingType;
}

const MappingsPage: React.FunctionComponent<IMappingsPageProps> = ({
  mappingType,
}: IMappingsPageProps) => {
  const sufficientProvidersQuery = useHasSufficientProvidersQuery();
  const clusterProvidersQuery = useClusterProvidersQuery();
  const mappingsQuery = useMappingsQuery(mappingType);

  const filteredMappings = filterSharedMappings(mappingsQuery.data?.items);

  const [isAddEditModalOpen, toggleAddEditModal] = React.useReducer((isOpen) => !isOpen, false);
  const [mappingBeingEdited, setMappingBeingEdited] = React.useState<Mapping | null>(null);

  const toggleModalAndResetEdit = () => {
    setMappingBeingEdited(null);
    toggleAddEditModal();
  };

  const openEditMappingModal = (mapping: Mapping) => {
    setMappingBeingEdited(mapping);
    toggleAddEditModal();
  };

  return (
    <>
      <PageSection variant="light">
        <Title headingLevel="h1">{mappingType} mappings</Title>
      </PageSection>
      <PageSection>
        <ResolvedQueries
          results={[sufficientProvidersQuery.result, clusterProvidersQuery, mappingsQuery]}
          errorTitles={[
            'Error loading provider inventory data',
            'Error loading providers from cluster',
            'Error loading mappings',
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
                      : 'Map source provider datastores to target provider storage classes.'}
                  </EmptyStateBody>
                  <CreateMappingButton onClick={toggleModalAndResetEdit} />
                </EmptyState>
              ) : (
                <MappingsTable
                  mappings={filteredMappings || []}
                  mappingType={mappingType}
                  openCreateMappingModal={toggleModalAndResetEdit}
                  openEditMappingModal={openEditMappingModal}
                />
              )}
            </CardBody>
          </Card>
        </ResolvedQueries>
      </PageSection>
      {isAddEditModalOpen ? (
        <AddEditMappingModal
          title={`${!mappingBeingEdited ? 'Create' : 'Edit'} ${mappingType.toLowerCase()} mapping`}
          onClose={toggleModalAndResetEdit}
          mappingType={mappingType}
          mappingBeingEdited={mappingBeingEdited}
        />
      ) : null}
    </>
  );
};
export default MappingsPage;
