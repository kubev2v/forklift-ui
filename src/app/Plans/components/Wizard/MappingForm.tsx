import * as React from 'react';
import {
  Checkbox,
  Grid,
  GridItem,
  TextContent,
  Text,
  Form,
  FormGroup,
  Flex,
  FlexItem,
  Select,
  SelectOption,
  SelectGroup,
  SelectOptionObject,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { ValidatedTextInput } from '@konveyor/lib-ui';

import { OptionWithValue } from '@app/common/components/SimpleSelect';
import {
  MappingType,
  Mapping,
  IVMwareProvider,
  IOpenShiftProvider,
  IVMwareVM,
  IPlan,
} from '@app/queries/types';
import { MappingBuilder, IMappingBuilderItem } from '@app/Mappings/components/MappingBuilder';
import { useMappingResourceQueries, useMappingsQuery } from '@app/queries';
import { PlanWizardFormState } from './PlanWizard';
import {
  getBuilderItemsFromMapping,
  getBuilderItemsWithMissingSources,
} from '@app/Mappings/components/MappingBuilder/helpers';
import { isSameResource } from '@app/queries/helpers';

import './MappingForm.css';
import { QueryStatus } from 'react-query';
import { ResolvedQueries } from '@app/common/components/ResolvedQuery';
import { isMappingValid } from '@app/Mappings/components/helpers';
import ConditionalTooltip from '@app/common/components/ConditionalTooltip';
import { usePausedPollingEffect } from '@app/common/context';

interface IMappingFormProps {
  form: PlanWizardFormState['storageMapping'] | PlanWizardFormState['networkMapping'];
  sourceProvider: IVMwareProvider | null;
  targetProvider: IOpenShiftProvider | null;
  mappingType: MappingType;
  selectedVMs: IVMwareVM[];
  planBeingEdited: IPlan | null;
}

const MappingForm: React.FunctionComponent<IMappingFormProps> = ({
  form,
  sourceProvider,
  targetProvider,
  mappingType,
  selectedVMs,
  planBeingEdited,
}: IMappingFormProps) => {
  usePausedPollingEffect();

  const mappingResourceQueries = useMappingResourceQueries(
    sourceProvider,
    targetProvider,
    mappingType
  );
  const { availableSources, availableTargets } = mappingResourceQueries;

  const hasInitialized = React.useRef(false);
  React.useEffect(() => {
    if (!hasInitialized.current && mappingResourceQueries.status === QueryStatus.Success) {
      hasInitialized.current = true;
      if (form.values.builderItems.length > 0) {
        form.fields.builderItems.setValue(
          getBuilderItemsWithMissingSources(
            form.values.builderItems,
            mappingResourceQueries,
            selectedVMs,
            mappingType,
            !!form.values.selectedExistingMapping
          )
        );
      }
    }
  }, [
    form.fields.builderItems,
    form.values.builderItems,
    form.values.selectedExistingMapping,
    mappingResourceQueries,
    mappingType,
    selectedVMs,
  ]);

  const mappingsQuery = useMappingsQuery(mappingType);

  const filteredMappings = (mappingsQuery.data?.items || []).filter(
    ({
      spec: {
        provider: { source, destination },
      },
    }) => isSameResource(source, sourceProvider) && isSameResource(destination, targetProvider)
  );

  const [isMappingSelectOpen, setIsMappingSelectOpen] = React.useState(false);

  const newMappingOption = {
    toString: () => `Create a ${mappingType.toLowerCase()} mapping`,
    value: 'new',
  };
  const mappingOptions = Object.values(filteredMappings).map((mapping) => {
    const isValid = isMappingValid(mappingType, mapping, availableSources, availableTargets);
    return {
      toString: () => mapping.metadata.name,
      value: mapping,
      props: {
        isDisabled: !isValid,
        className: !isValid ? 'disabled-with-pointer-events' : '',
        children: (
          <ConditionalTooltip
            isTooltipEnabled={!isValid}
            content="This mapping cannot be selected because it includes missing source or target resources"
          >
            <div>{mapping.metadata.name}</div>
          </ConditionalTooltip>
        ),
      },
    };
  }) as OptionWithValue<Mapping>[];

  const populateMappingBuilder = (mapping?: Mapping) => {
    const newBuilderItems: IMappingBuilderItem[] = !mapping
      ? []
      : getBuilderItemsFromMapping(mapping, mappingType, availableSources, availableTargets);
    form.fields.builderItems.setValue(
      getBuilderItemsWithMissingSources(
        newBuilderItems,
        mappingResourceQueries,
        selectedVMs,
        mappingType,
        true
      )
    );
    form.fields.isSaveNewMapping.setValue(false);
  };

  const hasAddedItems = form.values.selectedExistingMapping
    ? form.values.selectedExistingMapping.spec.map.length < form.values.builderItems.length
    : planBeingEdited
    ? (mappingType === MappingType.Network
        ? planBeingEdited.spec.map.networks
        : planBeingEdited.spec.map.datastores
      ).length < form.values.builderItems.length
    : false;

  return (
    <ResolvedQueries
      results={[...mappingResourceQueries.queries, mappingsQuery]}
      errorTitles={[
        'Error loading source provider resources',
        'Error loading target provider resources',
        'Error loading mappings',
      ]}
    >
      <Form>
        {!form.values.isPrefilled ? (
          <TextContent>
            <Text component="p">
              Select an existing {mappingType.toLowerCase()} mapping to modify or create a new{' '}
              {mappingType.toLowerCase()} mapping.
            </Text>
          </TextContent>
        ) : null}
        <Flex direction={{ default: 'column' }} className={spacing.mbMd}>
          {!form.values.isPrefilled ? (
            <FlexItem>
              <FormGroup isRequired fieldId="mappingSelect">
                <Select
                  id="mappingSelect"
                  aria-label="Select mapping"
                  placeholderText={`Select a ${mappingType.toLowerCase()} mapping`}
                  isGrouped
                  isOpen={isMappingSelectOpen}
                  onToggle={setIsMappingSelectOpen}
                  onSelect={(_event, selection: SelectOptionObject) => {
                    const sel = selection as OptionWithValue<Mapping | 'new'>;
                    if (sel.value === 'new') {
                      form.fields.isCreateMappingSelected.setValue(true);
                      form.fields.selectedExistingMapping.setValue(null);
                      populateMappingBuilder();
                    } else {
                      form.fields.isCreateMappingSelected.setValue(false);
                      form.fields.selectedExistingMapping.setValue(sel.value);
                      populateMappingBuilder(sel.value);
                    }
                    setIsMappingSelectOpen(false);
                  }}
                  selections={
                    form.values.isCreateMappingSelected
                      ? [newMappingOption]
                      : form.values.selectedExistingMapping
                      ? [
                          mappingOptions.find((option) =>
                            isSameResource(
                              option.value.metadata,
                              form.values.selectedExistingMapping?.metadata
                            )
                          ),
                        ]
                      : []
                  }
                >
                  <SelectOption key={newMappingOption.toString()} value={newMappingOption} />
                  <SelectGroup
                    label={
                      mappingOptions.length > 0
                        ? 'Existing mappings'
                        : 'No existing mappings match your selected providers'
                    }
                  >
                    {mappingOptions.map((option) => (
                      <SelectOption key={option.toString()} value={option} {...option.props} />
                    ))}
                  </SelectGroup>
                </Select>
              </FormGroup>
            </FlexItem>
          ) : null}

          {(form.values.isCreateMappingSelected ||
            form.values.selectedExistingMapping ||
            form.values.isPrefilled) && (
            <>
              <MappingBuilder
                mappingType={mappingType}
                availableSources={availableSources}
                availableTargets={availableTargets}
                builderItems={form.values.builderItems}
                setBuilderItems={form.fields.builderItems.setValue}
                isWizardMode
              />
              {form.values.isCreateMappingSelected || form.values.isPrefilled || hasAddedItems ? (
                <>
                  <Checkbox
                    label="Save mapping to use again"
                    aria-label="save mapping checkbox"
                    id="save-mapping-check"
                    isChecked={form.values.isSaveNewMapping}
                    onChange={() =>
                      form.fields.isSaveNewMapping.setValue(!form.values.isSaveNewMapping)
                    }
                    className={spacing.mtMd}
                  />
                  {form.values.isSaveNewMapping && (
                    <Grid className={spacing.mbMd}>
                      <GridItem sm={12} md={5} className={spacing.mbMd}>
                        <ValidatedTextInput
                          field={form.fields.newMappingName}
                          label="Name"
                          fieldId="new-mapping-name"
                        />
                      </GridItem>
                    </Grid>
                  )}
                </>
              ) : null}
            </>
          )}
        </Flex>
      </Form>
    </ResolvedQueries>
  );
};

export default MappingForm;
