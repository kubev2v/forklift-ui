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
import { IStorageMapping, MappingType } from '@app/queries/types';
import { PlusCircleIcon } from '@patternfly/react-icons';
import MappingsTable from '../components/MappingsTable';
import AddEditMappingModal from '../components/AddEditMappingModal';
import { fetchMockStorage } from '@app/queries/mocks/helpers';
import LoadingEmptyState from '@app/common/components/LoadingEmptyState';
import { useHasSufficientProvidersQuery } from '@app/queries';
import CreateMappingButton from '../components/CreateMappingButton';

// TODO we should probably combine this and NetworkMappingsPage, they're nearly identical

const isFetchingInitialStorageMappings = false; // Fetching for the first time, not polling

const StorageMappingsPage: React.FunctionComponent = () => {
  //TODO: replace with real state from react-query
  const [storageMappings, setStorageMappings] = React.useState<IStorageMapping[]>([]);
  const [isAddEditModalOpen, toggleAddEditModal] = React.useReducer((isOpen) => !isOpen, false);

  //TODO: replace with real state from react-query
  const mockMapObj = localStorage.getItem('storageMappingsObject');
  React.useEffect(() => {
    console.log(`TODO: fetch storage mapping items`);
    const currentMappings = fetchMockStorage(MappingType.Storage);
    setStorageMappings((currentMappings as IStorageMapping[]) || []);
  }, [mockMapObj]);

  const sufficientProvidersQuery = useHasSufficientProvidersQuery();

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
          <Alert variant="danger" title="Error loading providers" />
        ) : (
          <Card>
            <CardBody>
              {!storageMappings ? null : storageMappings.length === 0 ? (
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
                  mappings={storageMappings}
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
