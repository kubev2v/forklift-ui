import * as React from 'react';
import {
  PageSection,
  Title,
  EmptyState,
  Card,
  CardBody,
  EmptyStateIcon,
  EmptyStateBody,
  Alert,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { MappingType } from '@app/queries/types';
import { PlusCircleIcon } from '@patternfly/react-icons';
import MappingsTable from '../components/MappingsTable';
import AddEditMappingModal from '../components/AddEditMappingModal';
import LoadingEmptyState from '@app/common/components/LoadingEmptyState';
import { useHasSufficientProvidersQuery, useMappingsQuery } from '@app/queries';
import CreateMappingButton from '../components/CreateMappingButton';

// TODO we should probably combine this and NetworkMappingsPage, they're nearly identical

const isFetchingInitialStorageMappings = false; // Fetching for the first time, not polling

const StorageMappingsPage: React.FunctionComponent = () => {
  const sufficientProvidersQuery = useHasSufficientProvidersQuery();
  const mappingsQuery = useMappingsQuery(MappingType.Storage);

  const [isAddEditModalOpen, toggleAddEditModal] = React.useReducer((isOpen) => !isOpen, false);

  return (
    <>
      <PageSection variant="light">
        <Title headingLevel="h1" size="lg">
          Storage mappings
        </Title>
      </PageSection>
      <PageSection>
        {sufficientProvidersQuery.isLoading || isFetchingInitialStorageMappings ? (
          <LoadingEmptyState />
        ) : sufficientProvidersQuery.isError ? (
          <Alert variant="danger" isInline title="Error loading providers" />
        ) : (
          <Card>
            <CardBody>
              {!mappingsQuery.data ? null : mappingsQuery.data.items.length === 0 ? (
                <EmptyState className={spacing.my_2xl}>
                  <EmptyStateIcon icon={PlusCircleIcon} />
                  <Title headingLevel="h2" size="lg">
                    No storage mappings
                  </Title>
                  <EmptyStateBody>
                    Map source provider datastores to target provider storage classes.
                  </EmptyStateBody>
                  <CreateMappingButton onClick={toggleAddEditModal} />
                </EmptyState>
              ) : (
                <MappingsTable
                  mappings={mappingsQuery.data?.items || []}
                  mappingType={MappingType.Storage}
                  toggleAddEditModal={toggleAddEditModal}
                />
              )}
            </CardBody>
          </Card>
        )}
      </PageSection>
      {isAddEditModalOpen ? (
        <AddEditMappingModal
          title="Create storage mapping"
          onClose={toggleAddEditModal}
          mappingType={MappingType.Storage}
        />
      ) : null}
    </>
  );
};
export default StorageMappingsPage;
