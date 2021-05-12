import * as React from 'react';
import { EditIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import {
  TextContent,
  Text,
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { TableComposable, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';

import { PlanWizardFormState } from './PlanWizard';
import PlanAddEditHookModal, { PlanHookInstance } from './PlanAddEditHookModal';

import './HooksForm.css';
import ConditionalTooltip from '@app/common/components/ConditionalTooltip';
import ConfirmModal from '@app/common/components/ConfirmModal';

interface IHooksFormProps {
  form: PlanWizardFormState['hooks'];
  isWarmMigration: boolean;
}

const HooksForm: React.FunctionComponent<IHooksFormProps> = ({
  form,
  isWarmMigration,
}: IHooksFormProps) => {
  const [isAddEditModalOpen, toggleAddEditModal] = React.useReducer((isOpen) => !isOpen, false);

  const onSaveInstance = (newHookInstance: PlanHookInstance) => {
    // TODO update the existing one instead of adding one if we are editing, once edit is working
    form.fields.instances.setValue([...form.values.instances, newHookInstance]);
    toggleAddEditModal();
  };

  const sortedInstances = [...form.values.instances].sort((a, b) => {
    if (a.step === 'PreHook' && b.step === 'PostHook') return -1;
    if (a.step === 'PostHook' && b.step === 'PreHook') return 1;
    return 0;
  });

  const hasPreHook = !!sortedInstances.find((instance) => instance.step === 'PreHook');
  const hasPostHook = !!sortedInstances.find((instance) => instance.step === 'PostHook');
  const migrationOrCutover = !isWarmMigration ? 'migration' : 'cutover';

  const [isRemoveModalOpen, toggleRemoveModal] = React.useReducer((isOpen) => !isOpen, false);
  const [instanceBeingRemoved, setInstanceBeingRemoved] = React.useState<PlanHookInstance | null>(
    null
  );

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
          <ConditionalTooltip
            isTooltipEnabled={hasPreHook && hasPostHook}
            content={`Only one pre-${migrationOrCutover} hook and one post-${migrationOrCutover} hook are allowed.`}
          >
            <span>
              <Button
                variant="secondary"
                onClick={toggleAddEditModal}
                isDisabled={hasPreHook && hasPostHook}
              >
                Add hook
              </Button>
            </span>
          </ConditionalTooltip>
          <TableComposable>
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Type</Th>
                <Th>Migration step</Th>
                <Th aria-label="Actions"></Th>
              </Tr>
            </Thead>
            <Tbody>
              {sortedInstances.map((instance) => (
                // TODO check for pattern of generated hook name, parse it to show the original given name
                <Tr key={instance.name}>
                  <Td>{instance.name}</Td>
                  <Td>
                    {instance.type === 'playbook' ? 'Ansible playbook' : 'Custom container image'}
                  </Td>
                  <Td>
                    {instance.step === 'PreHook'
                      ? `Pre-${migrationOrCutover}`
                      : `Post-${migrationOrCutover}`}
                  </Td>
                  <Td modifier="fitContent">
                    <Button variant="plain" aria-label="Edit" onClick={() => alert('TODO')}>
                      <EditIcon />
                    </Button>
                    <Button
                      variant="plain"
                      aria-label="Remove"
                      onClick={() => {
                        setInstanceBeingRemoved(instance);
                        toggleRemoveModal();
                      }}
                    >
                      <TrashIcon />
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </TableComposable>
        </>
      )}
      {isAddEditModalOpen ? (
        <PlanAddEditHookModal
          onClose={toggleAddEditModal}
          onSave={onSaveInstance}
          instanceBeingEdited={null} // TODO
          isWarmMigration={isWarmMigration}
          hasPreHook={hasPreHook}
          hasPostHook={hasPostHook}
        />
      ) : null}
      <ConfirmModal
        isOpen={isRemoveModalOpen}
        toggleOpen={toggleRemoveModal}
        mutateFn={() => {
          form.fields.instances.setValue(
            form.values.instances.filter((i) => i !== instanceBeingRemoved)
          );
          toggleRemoveModal();
        }}
        title="Remove hook"
        confirmButtonText="Remove"
        body={
          <>
            Are you sure you want to remove the hook &quot;
            <strong>{instanceBeingRemoved?.name}</strong>&quot; from the migration plan?
          </>
        }
      />
    </>
  );
};

export default HooksForm;
