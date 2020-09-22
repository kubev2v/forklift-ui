import * as React from 'react';
import {
  PageSection,
  Title,
  EmptyState,
  EmptyStateIcon,
  EmptyStateBody,
  Button,
  Card,
  CardBody,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { INetworkMapping, MappingType } from '@app/queries/types';
import MappingsTable from '../components/MappingsTable';
import AddEditMappingModal from '../components/AddEditMappingModal';
import { fetchMockStorage } from '@app/queries/mocks/helpers';
import LoadingEmptyState from '@app/common/components/LoadingEmptyState';

const isFetchingInitialNetworkMappings = false; // Fetching for the first time, not polling

const NetworkMappingsPage: React.FunctionComponent = () => {
  //TODO: replace with real state from react-query
  const [networkMappings, setNetworkMappings] = React.useState<INetworkMapping[]>([]);

  //TODO: replace with real state from react-query
  const mockMapObj = localStorage.getItem('networkMappingsObject');
  React.useEffect(() => {
    console.log(`TODO: fetch network mapping items`);
    const currentMappings = fetchMockStorage(MappingType.Network);
    setNetworkMappings((currentMappings as INetworkMapping[]) || []);
  }, [mockMapObj]);

  const [isAddEditModalOpen, toggleAddEditModal] = React.useReducer((isOpen) => !isOpen, false);
  return (
    <>
      <PageSection variant="light">
        <Title headingLevel="h1" size="lg">
          Network mappings
        </Title>
      </PageSection>
      <PageSection>
        {isFetchingInitialNetworkMappings ? (
          <LoadingEmptyState />
        ) : (
          <Card>
            <CardBody>
              {!networkMappings ? null : networkMappings.length === 0 ? (
                <EmptyState className={spacing.my_2xl}>
                  <EmptyStateIcon icon={PlusCircleIcon} />
                  <Title headingLevel="h2" size="lg">
                    No network mappings
                  </Title>
                  <EmptyStateBody>
                    Map source provider networks to target provider networks.
                  </EmptyStateBody>
                  <Button onClick={toggleAddEditModal} variant="primary">
                    Create mapping
                  </Button>
                </EmptyState>
              ) : (
                <MappingsTable
                  mappings={networkMappings}
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
