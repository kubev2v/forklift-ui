import * as React from 'react';
import {
  Card,
  PageSection,
  CardBody,
  EmptyState,
  EmptyStateIcon,
  EmptyStateBody,
  Title,
  Button,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { PlusCircleIcon } from '@patternfly/react-icons';

import { useHooksQuery } from '@app/queries';

import HooksTable from './components/HooksTable';
import { ResolvedQueries } from '@app/common/components/ResolvedQuery';
import { IHook } from '@app/queries/types';
import AddEditHookModal from './components/AddEditHookModal';

const HooksPage: React.FunctionComponent = () => {
  const hooksQuery = useHooksQuery();

  const [isAddEditModalOpen, toggleAddEditModal] = React.useReducer((isOpen) => !isOpen, false);
  const [hookBeingEdited, setHookBeingEdited] = React.useState<IHook | null>(null);

  const toggleModalAndResetEdit = () => {
    setHookBeingEdited(null);
    toggleAddEditModal();
  };

  const openEditHookModal = (hook: IHook) => {
    setHookBeingEdited(hook);
    toggleAddEditModal();
  };

  return (
    <>
      <PageSection variant="light">
        <Title headingLevel="h1">Hooks</Title>
      </PageSection>
      <PageSection>
        <ResolvedQueries
          results={[hooksQuery]}
          errorTitles={['Error loading hooks']}
          errorsInline={false}
        >
          <Card>
            <CardBody>
              {!hooksQuery.data ? null : hooksQuery.data.items.length === 0 ? (
                <EmptyState className={spacing.my_2xl}>
                  <EmptyStateIcon icon={PlusCircleIcon} />
                  <Title size="lg" headingLevel="h2">
                    No hooks
                  </Title>
                  <EmptyStateBody>
                    Hooks are contained in Ansible playbooks that can be run before or after the
                    migration. They are added to a migration plan during plan creation.
                  </EmptyStateBody>
                  <Button onClick={() => toggleModalAndResetEdit()} id="create-hooks-button">
                    Create hook
                  </Button>
                </EmptyState>
              ) : (
                <HooksTable
                  hooks={hooksQuery.data?.items || []}
                  openCreateHookModal={toggleModalAndResetEdit}
                  openEditHookModal={openEditHookModal}
                />
              )}
            </CardBody>
          </Card>
        </ResolvedQueries>
      </PageSection>
      {isAddEditModalOpen ? (
        <AddEditHookModal onClose={toggleModalAndResetEdit} hookBeingEdited={hookBeingEdited} />
      ) : null}
    </>
  );
};

export default HooksPage;
