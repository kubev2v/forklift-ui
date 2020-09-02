import * as React from 'react';
import {
  PageSection,
  Title,
  Bullseye,
  EmptyState,
  Spinner,
  Card,
  CardBody,
  EmptyStateIcon,
  EmptyStateBody,
  Button,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { IStorageMapping, MappingType } from '../types';
import { PlusCircleIcon } from '@patternfly/react-icons';
import MappingsTable from '../components/MappingsTable';
import AddEditMappingModal from '../components/AddEditMappingModal';

// TODO replace these with real state e.g. from redux
const isFetchingInitialStorageMappings = false; // Fetching for the first time, not polling
const storageMappings: IStorageMapping[] = [];

const StorageMappingsPage: React.FunctionComponent = () => {
  const [isAddEditModalOpen, toggleAddEditModal] = React.useReducer((isOpen) => !isOpen, false);
  return (
    <>
      <PageSection variant="light">
        <Title headingLevel="h1" size="lg">
          Storage mappings
        </Title>
      </PageSection>
      <PageSection>
        {isFetchingInitialStorageMappings ? (
          <Bullseye>
            <EmptyState>
              <div className="pf-c-empty-state__icon">
                <Spinner size="xl" />
              </div>
              <Title headingLevel="h2">Loading...</Title>
            </EmptyState>
          </Bullseye>
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
                  <Button onClick={toggleAddEditModal} variant="primary">
                    Create mapping
                  </Button>
                </EmptyState>
              ) : (
                <MappingsTable mappings={storageMappings} mappingType={MappingType.Storage} />
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
