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
import MappingsTable from './components/MappingsTable';
import AddEditMappingModal from './components/AddEditMappingModal';
import LoadingEmptyState from '@app/common/components/LoadingEmptyState';
import { useHasSufficientProvidersQuery, useMappingsQuery } from '@app/queries';
import CreateMappingButton from './components/CreateMappingButton';

interface IMappingsPageProps {
  mappingType: MappingType;
}

const MappingsPage: React.FunctionComponent<IMappingsPageProps> = ({
  mappingType,
}: IMappingsPageProps) => {
  const sufficientProvidersQuery = useHasSufficientProvidersQuery();
  const mappingsQuery = useMappingsQuery(mappingType);

  const [isAddEditModalOpen, toggleAddEditModal] = React.useReducer((isOpen) => !isOpen, false);

  return (
    <>
      <PageSection variant="light">
        <Title headingLevel="h1" size="lg">
          {mappingType} mappings
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
                    No {mappingType.toLowerCase()} mappings
                  </Title>
                  <EmptyStateBody>
                    {mappingType === MappingType.Network
                      ? 'Map source provider networks to target provider networks.'
                      : 'Map source provider datastores to target provider storage classes.'}
                  </EmptyStateBody>
                  <CreateMappingButton onClick={toggleAddEditModal} />
                </EmptyState>
              ) : (
                <MappingsTable
                  mappings={mappingsQuery.data?.items || []}
                  mappingType={mappingType}
                  toggleAddEditModal={toggleAddEditModal}
                />
              )}
            </CardBody>
          </Card>
        )}
      </PageSection>
      {isAddEditModalOpen ? (
        <AddEditMappingModal
          title={`Create ${mappingType.toLowerCase()} mapping`}
          onClose={toggleAddEditModal}
          mappingType={mappingType}
        />
      ) : null}
    </>
  );
};
export default MappingsPage;
