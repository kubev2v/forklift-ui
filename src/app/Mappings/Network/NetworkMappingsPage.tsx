import * as React from 'react';
import {
  PageSection,
  Title,
  EmptyState,
  EmptyStateIcon,
  EmptyStateBody,
  Card,
  CardBody,
  Alert,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { MappingType } from '@app/queries/types';
import MappingsTable from '../components/MappingsTable';
import AddEditMappingModal from '../components/AddEditMappingModal';
import LoadingEmptyState from '@app/common/components/LoadingEmptyState';
import { useHasSufficientProvidersQuery, useMappingsQuery } from '@app/queries';
import CreateMappingButton from '../components/CreateMappingButton';

// TODO we should probably combine this and StorageMappingsPage, they're nearly identical

const NetworkMappingsPage: React.FunctionComponent = () => {
  const sufficientProvidersQuery = useHasSufficientProvidersQuery();
  const mappingsQuery = useMappingsQuery(MappingType.Network);

  const [isAddEditModalOpen, toggleAddEditModal] = React.useReducer((isOpen) => !isOpen, false);

  return (
    <>
      <PageSection variant="light">
        <Title headingLevel="h1" size="lg">
          Network mappings
        </Title>
      </PageSection>
      <PageSection>
        {sufficientProvidersQuery.isLoading || mappingsQuery.isLoading ? (
          <LoadingEmptyState />
        ) : sufficientProvidersQuery.isError ? (
          <Alert variant="danger" isInline title="Error loading providers" />
        ) : mappingsQuery.isError ? (
          <Alert variant="danger" isInline title="Error loading mappings" />
        ) : (
          <Card>
            <CardBody>
              {!mappingsQuery.data ? null : mappingsQuery.data.items.length === 0 ? (
                <EmptyState className={spacing.my_2xl}>
                  <EmptyStateIcon icon={PlusCircleIcon} />
                  <Title headingLevel="h2" size="lg">
                    No network mappings
                  </Title>
                  <EmptyStateBody>
                    Map source provider networks to target provider networks.
                  </EmptyStateBody>
                  <CreateMappingButton onClick={toggleAddEditModal} />
                </EmptyState>
              ) : (
                <MappingsTable
                  mappings={mappingsQuery.data?.items || []}
                  mappingType={MappingType.Network}
                  toggleAddEditModal={toggleAddEditModal}
                />
              )}
            </CardBody>
          </Card>
        )}
      </PageSection>
      {isAddEditModalOpen ? (
        <AddEditMappingModal
          title="Create network mapping"
          onClose={toggleAddEditModal}
          mappingType={MappingType.Network}
        />
      ) : null}
    </>
  );
};

export default NetworkMappingsPage;
