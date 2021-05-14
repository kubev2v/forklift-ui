import * as React from 'react';
import * as yup from 'yup';
import { ResolvedQuery } from '@app/common/components/ResolvedQuery';
import { usePausedPollingEffect } from '@app/common/context';
import {
  HookStep,
  populateHookFields,
  useEditPlanHookInstancePrefillEffect,
  useHookDefinitionFields,
} from '@app/Hooks/components/helpers';
import { filterSharedHooks, useHooksQuery } from '@app/queries';
import { IHook, IMetaObjectMeta } from '@app/queries/types';
import { getFormGroupProps, useFormField, useFormState } from '@konveyor/lib-ui';
import {
  Modal,
  Stack,
  Flex,
  Button,
  Form,
  FormGroup,
  Select,
  SelectOptionObject,
  SelectOption,
  SelectGroup,
} from '@patternfly/react-core';
import LoadingEmptyState from '@app/common/components/LoadingEmptyState';
import HookDefinitionInputs from '@app/Hooks/components/HookDefinitionInputs';
import SimpleSelect, { OptionWithValue } from '@app/common/components/SimpleSelect';
import { isSameResource } from '@app/queries/helpers';
import ConditionalTooltip from '@app/common/components/ConditionalTooltip';

const usePlanHookInstanceFormState = (
  existingHookNames: string[],
  editingHookName: string | null
) => {
  const isCreateHookSelected = useFormField(false, yup.boolean().required());
  const selectedExistingHook = useFormField<IHook | null>(null, yup.mixed<IHook | null>());
  return useFormState({
    isCreateHookSelected,
    selectedExistingHook,
    ...useHookDefinitionFields(
      existingHookNames,
      editingHookName ||
        (selectedExistingHook.value &&
          (selectedExistingHook.value.metadata as IMetaObjectMeta).name) ||
        null,
      false
    ),
    step: useFormField<HookStep | null>(
      null,
      yup.mixed<HookStep | null>().label('Step').required()
    ),
  });
};

export type PlanHookInstanceFormState = ReturnType<typeof usePlanHookInstanceFormState>;
export type PlanHookInstance = PlanHookInstanceFormState['values'];

interface IPlanAddEditHookModalProps {
  onClose: () => void;
  onSave: (instance: PlanHookInstance) => void;
  instanceBeingEdited: PlanHookInstance | null;
  isWarmMigration: boolean;
  hasPreHook: boolean;
  hasPostHook: boolean;
  existingInstanceNames: string[];
}

const PlanAddEditHookModal: React.FunctionComponent<IPlanAddEditHookModalProps> = ({
  onClose,
  onSave,
  instanceBeingEdited,
  isWarmMigration,
  hasPreHook,
  hasPostHook,
  existingInstanceNames,
}: IPlanAddEditHookModalProps) => {
  usePausedPollingEffect();

  const hooksQuery = useHooksQuery();

  const existingHookNames = [
    ...existingInstanceNames,
    ...(hooksQuery.data?.items.map((hook) => (hook.metadata as IMetaObjectMeta).name) || []),
  ];
  const instanceForm = usePlanHookInstanceFormState(
    existingHookNames,
    instanceBeingEdited?.name || null
  );

  const [isExistingHookSelectOpen, setIsExistingHookSelectOpen] = React.useState(false);
  const newHookOption = {
    toString: () => 'Create a new hook',
    value: 'new',
  };
  const filteredHooks = filterSharedHooks(hooksQuery.data?.items);
  const hookOptions = Object.values(filteredHooks).map(
    (hook) =>
      ({
        toString: () => (hook.metadata as IMetaObjectMeta).name,
        value: hook,
      } as OptionWithValue<IHook>)
  );

  const populateFromExistingHook = (hook: IHook | null) => {
    populateHookFields(instanceForm.fields, hook, 'setValue', !!hook);
    if (hook) {
      instanceForm.fields.step.setIsTouched(true); // Call out the only empty required field
    }
  };

  const { isDonePrefilling } = useEditPlanHookInstancePrefillEffect(
    instanceForm,
    instanceBeingEdited
  );

  const migrationOrCutover = !isWarmMigration ? 'migration' : 'cutover';

  const preHookDisabled = hasPreHook && instanceBeingEdited?.step !== 'PreHook';
  const postHookDisabled = hasPostHook && instanceBeingEdited?.step !== 'PostHook';

  const stepOptions: OptionWithValue<HookStep>[] = [
    {
      toString: () => `Pre-${migrationOrCutover}`,
      value: 'PreHook',
      props: {
        isDisabled: preHookDisabled,
        className: preHookDisabled ? 'disabled-with-pointer-events' : '',
        children: (
          <ConditionalTooltip
            isTooltipEnabled={preHookDisabled}
            content={`Only one pre-${migrationOrCutover} hook is allowed.`}
            position="left"
          >
            <div>{`Pre-${migrationOrCutover}`}</div>
          </ConditionalTooltip>
        ),
      },
    },
    {
      toString: () => `Post-${migrationOrCutover}`,
      value: 'PostHook',
      props: {
        isDisabled: postHookDisabled,
        className: postHookDisabled ? 'disabled-with-pointer-events' : '',
        children: (
          <ConditionalTooltip
            isTooltipEnabled={postHookDisabled}
            content={`Only one post-${migrationOrCutover} hook is allowed.`}
            position="left"
          >
            <div>{`Post-${migrationOrCutover}`}</div>
          </ConditionalTooltip>
        ),
      },
    },
  ];

  return (
    <Modal
      className="AddEditHookModal"
      variant="medium"
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
              isDisabled={!instanceForm.isValid || (!instanceBeingEdited && !instanceForm.isDirty)}
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
              // TODO: candidate for new shared component with MappingForm: SelectNewOrExisting<T>
              <FormGroup
                label="Add an existing hook or create a new one"
                isRequired
                fieldId="existing-hook-select"
              >
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
                  menuAppendTo="parent"
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
            ) : null}
            {instanceForm.values.isCreateHookSelected ||
            instanceForm.values.selectedExistingHook ||
            !!instanceBeingEdited ? (
              <>
                <HookDefinitionInputs
                  fields={instanceForm.fields}
                  editingHookName={instanceBeingEdited?.name || null}
                  hideName
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
                        stepOptions.find(
                          (option) => option.value === instanceForm.fields.step.value
                        ),
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
              </>
            ) : null}
          </Form>
        )}
      </ResolvedQuery>
    </Modal>
  );
};

export default PlanAddEditHookModal;
