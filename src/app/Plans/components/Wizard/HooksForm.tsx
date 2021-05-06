import * as React from 'react';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { PlanWizardFormState } from './PlanWizard';
import {
  TextContent,
  Text,
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import PlanAddEditHookModal, { PlanHookInstance } from './PlanAddEditHookModal';

interface IHooksFormProps {
  form: PlanWizardFormState['hooks'];
}

const HooksForm: React.FunctionComponent<IHooksFormProps> = ({ form }: IHooksFormProps) => {
  const [isAddEditModalOpen, toggleAddEditModal] = React.useReducer((isOpen) => !isOpen, false);

  // TODO disable the Add button if both a pre and post hook are already added

  const onSaveInstance = (newHookInstance: PlanHookInstance) => {
    // TODO update the existing one instead of adding one if we are editing, once edit is working
    form.fields.instances.setValue([...form.values.instances, newHookInstance]);
    toggleAddEditModal();
  };

  return (
    <>
      <TextContent className={spacing.mbMd}>
        <Text component="p">
          Hooks are contained in Ansible playbooks that can be run before or after the migration.
        </Text>
      </TextContent>
      {form.values.instances.length === 0 ? (
        <EmptyState className={spacing.my_2xl}>
          <EmptyStateIcon icon={PlusCircleIcon} />
          <EmptyStateBody className={spacing.mt_0}>
            No hooks have been added to this migration plan
          </EmptyStateBody>
          <Button variant="secondary" className={spacing.mtMd} onClick={toggleAddEditModal}>
            Add hook
          </Button>
        </EmptyState>
      ) : (
        <>
          <Button variant="secondary" onClick={toggleAddEditModal}>
            Add hook
          </Button>
          <h1>TODO: table here</h1>
        </>
      )}
      {isAddEditModalOpen ? (
        <PlanAddEditHookModal
          onClose={toggleAddEditModal}
          onSave={onSaveInstance}
          instanceBeingEdited={null} // TODO
        />
      ) : null}
    </>
  );
};

export default HooksForm;
