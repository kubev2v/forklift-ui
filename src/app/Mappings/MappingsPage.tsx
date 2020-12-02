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
import LoadingEmptyState from '@app/common/components/LoadingEmptyState';
import { useHasSufficientProvidersQuery, useMappingsQuery } from '@app/queries';
import CreateMappingButton from './components/CreateMappingButton';
import QueryResultStatus from '@app/common/components/QueryResultStatus';

interface IMappingsPageProps {
  mappingType: MappingType;
}

const MappingsPage: React.FunctionComponent<IMappingsPageProps> = ({
  mappingType,
}: IMappingsPageProps) => {
  const sufficientProvidersQuery = useHasSufficientProvidersQuery();
  const mappingsQuery = useMappingsQuery(mappingType);

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
        {sufficientProvidersQuery.isLoading || mappingsQuery.isLoading ? (
          <LoadingEmptyState />
        ) : sufficientProvidersQuery.isError ? (
          <QueryResultStatus
            result={sufficientProvidersQuery.result}
            errorTitle="Error loading providers"
          />
        ) : mappingsQuery.isError ? (
          <QueryResultStatus result={mappingsQuery} errorTitle="Error loading mappings" />
        ) : (
          <Card>
            <CardBody>
              {!mappingsQuery.data ? null : mappingsQuery.data.items.length === 0 ? (
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
                  mappings={mappingsQuery.data?.items || []}
                  mappingType={mappingType}
                  openCreateMappingModal={toggleModalAndResetEdit}
                  openEditMappingModal={openEditMappingModal}
                />
              )}
            </CardBody>
          </Card>
        )}
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
