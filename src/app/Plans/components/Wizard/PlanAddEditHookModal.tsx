import * as React from 'react';
import * as yup from 'yup';
import { ResolvedQuery } from '@app/common/components/ResolvedQuery';
import { usePausedPollingEffect } from '@app/common/context';
import { HookStep, useHookDefinitionFields } from '@app/Hooks/components/helpers';
import { filterSharedHooks, useHooksQuery } from '@app/queries';
import { IHook } from '@app/queries/types';
import { getFormGroupProps, useFormField, useFormState } from '@konveyor/lib-ui';
import {
  Modal,
  Stack,
  Flex,
  Button,
  Form,
  FormGroup,
  FlexItem,
  Select,
  SelectOptionObject,
  SelectOption,
  SelectGroup,
} from '@patternfly/react-core';
import { IKubeList } from '@app/client/types';
import { QueryResult } from 'react-query';
import LoadingEmptyState from '@app/common/components/LoadingEmptyState';
import HookDefinitionInputs from '@app/Hooks/components/HookDefinitionInputs';
import SimpleSelect, { OptionWithValue } from '@app/common/components/SimpleSelect';
import { isSameResource } from '@app/queries/helpers';

const usePlanHookInstanceFormState = (
  hooksQuery: QueryResult<IKubeList<IHook>>,
  editingHookName: string | null
) => {
  const isCreateHookSelected = useFormField(false, yup.boolean().required());
  return useFormState({
    isCreateHookSelected,
    selectedExistingHook: useFormField<IHook | null>(null, yup.mixed<IHook | null>()),
    ...useHookDefinitionFields(hooksQuery, editingHookName, isCreateHookSelected.value),
    step: useFormField<HookStep | null>(
      null,
      yup.mixed().oneOf(['PreHook', 'PostHook']).required()
    ),
    // TODO do we need service account name? what about environment variables? see variants of mockups...
    // TODO do we need an isPrefilled here? prefill hook?
  });
};

export type PlanHookInstanceFormState = ReturnType<typeof usePlanHookInstanceFormState>;
export type PlanHookInstance = PlanHookInstanceFormState['values'];

interface IPlanAddEditHookModalProps {
  onClose: () => void;
  onSave: (instance: PlanHookInstance) => void;
  instanceBeingEdited: PlanHookInstance | null;
}

const PlanAddEditHookModal: React.FunctionComponent<IPlanAddEditHookModalProps> = ({
  onClose,
  onSave,
  instanceBeingEdited,
}: IPlanAddEditHookModalProps) => {
  usePausedPollingEffect();

  const hooksQuery = useHooksQuery();

  const instanceForm = usePlanHookInstanceFormState(hooksQuery, instanceBeingEdited?.name || null);

  const [isExistingHookSelectOpen, setIsExistingHookSelectOpen] = React.useState(false);
  const newHookOption = {
    toString: () => 'Create a new hook',
    value: 'new',
  };
  const filteredHooks = filterSharedHooks(hooksQuery.data?.items);
  const hookOptions = Object.values(filteredHooks).map(
    (hook) =>
      ({
        toString: () => hook.metadata.name,
        value: hook,
      } as OptionWithValue<IHook>)
  );

  const populateFromExistingHook = (hook: IHook | null) => {
    instanceForm.fields.name.setValue(hook?.metadata.name || '');
    instanceForm.fields.url.setValue(hook?.spec.url || '');
    instanceForm.fields.branch.setValue(hook?.spec.url || '');
  };

  const isDonePrefilling = true; // TODO

  // TODO disable step options that already have a hook instance that isn't the one being edited!
  const stepOptions: OptionWithValue<HookStep>[] = [
    {
      toString: () => 'Pre-migration',
      value: 'PreHook',
    },
    {
      toString: () => 'Post-migration',
      value: 'PostHook',
    },
  ];

  return (
    <Modal
      className="AddEditHookModal"
      variant="small"
      title={`${!instanceBeingEdited ? 'Add' : 'Edit'} hook`}
      isOpen
      onClose={onClose}
      footer={
        <Stack hasGutter>
          <Flex spaceItems={{ default: 'spaceItemsSm' }}>
            <Button
              id="modal-confirm-button"
              key="confirm"
              variant="primary"
              isDisabled={!instanceForm.isDirty || !instanceForm.isValid}
              onClick={() => onSave(instanceForm.values)}
            >
              {!instanceBeingEdited ? 'Add' : 'Save'}
            </Button>
            <Button id="modal-cancel-button" key="cancel" variant="link" onClick={() => onClose()}>
              Cancel
            </Button>
          </Flex>
        </Stack>
      }
    >
      <ResolvedQuery result={hooksQuery} errorTitle="Error loading hooks">
        {!isDonePrefilling ? (
          <LoadingEmptyState />
        ) : (
          <Form>
            {!instanceBeingEdited ? (
              <FlexItem>
                {/* TODO: candidate for new shared component with MappingForm: SelectNewOrExisting<T> */}
                <FormGroup isRequired fieldId="existing-hook-select">
                  <Select
                    id="existing-hook-select"
                    aria-label="Add an existing hook or create a new one"
                    placeholderText="Select..."
                    isGrouped
                    isOpen={isExistingHookSelectOpen}
                    onToggle={setIsExistingHookSelectOpen}
                    onSelect={(_event, selection: SelectOptionObject) => {
                      const sel = selection as OptionWithValue<IHook | 'new'>;
                      if (sel.value === 'new') {
                        instanceForm.fields.isCreateHookSelected.setValue(true);
                        instanceForm.fields.selectedExistingHook.setValue(null);
                        populateFromExistingHook(null);
                      } else {
                        instanceForm.fields.isCreateHookSelected.setValue(false);
                        instanceForm.fields.selectedExistingHook.setValue(sel.value);
                        populateFromExistingHook(sel.value);
                      }
                      setIsExistingHookSelectOpen(false);
                    }}
                    selections={
                      instanceForm.values.isCreateHookSelected
                        ? [newHookOption]
                        : instanceForm.values.selectedExistingHook
                        ? [
                            hookOptions.find((option) =>
                              isSameResource(
                                option.value.metadata,
                                instanceForm.values.selectedExistingHook?.metadata
                              )
                            ),
                          ]
                        : []
                    }
                  >
                    <SelectOption key={newHookOption.toString()} value={newHookOption} />
                    <SelectGroup
                      label={hookOptions.length > 0 ? 'Existing hooks' : 'No existing hooks'}
                    >
                      {hookOptions.map((option) => (
                        <SelectOption key={option.toString()} value={option} {...option.props} />
                      ))}
                    </SelectGroup>
                  </Select>
                </FormGroup>
              </FlexItem>
            ) : null}
            <HookDefinitionInputs
              fields={instanceForm.fields}
              editingHookName={instanceBeingEdited?.name || null}
              hideName={!!instanceForm.values.selectedExistingHook}
            >
              <FormGroup
                label="Step when the hook will be run"
                isRequired
                fieldId="hook-step-select"
                {...getFormGroupProps(instanceForm.fields.step)}
              >
                <SimpleSelect
                  id="hook-step-select"
                  toggleId="hook-step-select-toggle"
                  aria-label="Step when the hook will be run"
                  options={stepOptions}
                  value={[
                    stepOptions.find((option) => option.value === instanceForm.fields.step.value),
                  ]}
                  onChange={(selection) =>
                    instanceForm.fields.step.setValue(
                      (selection as OptionWithValue<HookStep>).value
                    )
                  }
                  placeholderText="Select..."
                />
              </FormGroup>
            </HookDefinitionInputs>
          </Form>
        )}
      </ResolvedQuery>
    </Modal>
  );
};

export default PlanAddEditHookModal;
