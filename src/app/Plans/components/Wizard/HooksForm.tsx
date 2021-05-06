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
import PlanAddEditHookModal from './PlanAddEditHookModal';
import { IHook } from '@app/queries/types';

interface IHooksFormProps {
  form: PlanWizardFormState['hooks'];
}

const HooksForm: React.FunctionComponent<IHooksFormProps> = ({ form }: IHooksFormProps) => {
  const hooks: IHook[] = []; // TODO load from a query based on what's in the plan? or prefilled form state?
  // TODO handle the fact that we'll be listing hook CRs that don't exist yet? I guess we can just store the whole object in form state?

  const [isAddEditModalOpen, toggleAddEditModal] = React.useReducer((isOpen) => !isOpen, false);
  // TODO show the AddEditHookModal from Gilles' PR with a isWizardMode flag or something, to add the extra fields?

  return (
    <>
      <TextContent className={spacing.mbMd}>
        <Text component="p">
          Hooks are contained in Ansible playbooks that can be run before or after the migration.
        </Text>
      </TextContent>
      {hooks.length === 0 ? (
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
        <PlanAddEditHookModal onClose={toggleAddEditModal} hookBeingEdited={null} />
      ) : null}
    </>
  );
};

export default HooksForm;
