import * as React from 'react';
import {
  Grid,
  GridItem,
  Popover,
  Button,
  List,
  ListItem,
  Text,
  TextContent,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { StatusIcon } from '@konveyor/lib-ui';
import text from '@patternfly/react-styles/css/utilities/Text/text';

import MappingDetailView from '@app/Mappings/components/MappingDetailView';
import { HookStep, IPlanVM, IVMwareVM, Mapping, MappingType } from '@app/queries/types';
import MappingStatus from '@app/Mappings/components/MappingStatus';
import { warmCriticalConcerns, someVMHasConcern } from './Wizard/helpers';

interface IHookDetails {
  step: HookStep | null;
  playbook: boolean;
}

interface IPlanDetailsProps {
  planName: string;
  description: string;
  sourceName: string;
  destinationName: string;
  targetNamespace: string;
  isNewNamespace?: boolean;
  planType: boolean;
  transferNetwork: string;
  planVMs: IPlanVM[];
  networkMapping: Mapping | null;
  storageMapping: Mapping | null;
  vms: IVMwareVM[] | undefined;
  hooksDetails: IHookDetails[] | null;
}

const PlanDetails: React.FunctionComponent<IPlanDetailsProps> = ({
  planName,
  description,
  sourceName,
  destinationName,
  targetNamespace,
  isNewNamespace = false,
  planType,
  transferNetwork,
  planVMs,
  networkMapping,
  storageMapping,
  vms,
  hooksDetails,
}: IPlanDetailsProps) => {
  const warmCriticalConcernsFound = planType
    ? warmCriticalConcerns.filter((label) => someVMHasConcern(vms as IVMwareVM[], label))
    : [];

  return (
    <Grid hasGutter className={`${spacing.mtSm} ${spacing.mbMd}`}>
      <GridItem md={12}></GridItem>
      <GridItem md={3}>Plan name</GridItem>
      <GridItem md={9} id="details-plan-name">
        {planName}
      </GridItem>
      {description ? (
        <>
          <GridItem md={3} id="plan-description-label">
            Plan description
          </GridItem>
          <GridItem md={9} id="details-plan-description" aria-labelledby="plan-description-label">
            {description}
          </GridItem>
        </>
      ) : null}
      <GridItem md={3} id="source-provider-label">
        Source provider
      </GridItem>
      <GridItem md={9} id="details-source-provider" aria-labelledby="source-provider-label">
        {sourceName}
      </GridItem>
      <GridItem md={3} id="target-provider-label">
        Target provider
      </GridItem>
      <GridItem md={9} id="details-target-provider" aria-labelledby="target-provider-label">
        {destinationName}
      </GridItem>
      <GridItem md={3} id="target-namespace-label">
        Target namespace
      </GridItem>
      <GridItem md={9}>
        <span id="details-target-namespace" aria-labelledby="target-namespace-label">
          {targetNamespace}
        </span>
        {isNewNamespace ? (
          <TextContent>
            <Text component="small" id="details-new-target-namespace-message">
              This is a new namespace that will be created when the plan is started.
            </Text>
          </TextContent>
        ) : null}
      </GridItem>
      <GridItem md={3} id="transfer-network-label">
        Migration transfer network
      </GridItem>
      <GridItem md={9} id="details-transfer-network" aria-labelledby="transfer-network-label">
        {transferNetwork}
      </GridItem>
      <GridItem md={3}>Selected VMs</GridItem>
      <GridItem md={9}>
        <Popover
          headerContent={<div>Selected VMs</div>}
          bodyContent={
            <List id="details-selected-vms-list">
              {planVMs.map((vm, index) => (
                <li key={index}>{vm.id}</li>
              ))}
            </List>
          }
        >
          <Button variant="link" isInline id="details-selected-vms-count">
            {planVMs.length}
          </Button>
        </Popover>
      </GridItem>
      <GridItem md={3} id="network-mapping-label">
        Network mapping{' '}
        {networkMapping ? (
          <MappingStatus
            className={spacing.mlXs}
            mappingType={MappingType.Network}
            mapping={networkMapping}
            isLabel={false}
            disableOk={true}
          />
        ) : null}
      </GridItem>
      <GridItem md={9} id="details-network-mapping" aria-labelledby="network-mapping-label">
        <MappingDetailView mappingType={MappingType.Network} mapping={networkMapping} />
      </GridItem>
      <GridItem md={3} id="storage-mapping-label">
        Storage mapping{' '}
        {storageMapping ? (
          <MappingStatus
            className={spacing.mlXs}
            mappingType={MappingType.Storage}
            mapping={storageMapping}
            isLabel={false}
            disableOk={true}
          />
        ) : null}
      </GridItem>
      <GridItem md={9} id="details-storage-mapping" aria-labelledby="storage-mapping-label">
        <MappingDetailView mappingType={MappingType.Storage} mapping={storageMapping} />
      </GridItem>
      <GridItem md={3} id="migration-type-label">
        Migration type{' '}
        {warmCriticalConcernsFound.length > 0 ? (
          <Popover
            hasAutoWidth
            bodyContent={
              <>
                <Text>
                  Warm migration will fail for one or more VMs because of the following conditions:
                </Text>
                <List className={`${spacing.mtSm} ${spacing.mlMd}`}>
                  {warmCriticalConcernsFound.map((label) => (
                    <ListItem key={label}>{label}</ListItem>
                  ))}
                </List>
              </>
            }
          >
            <Button variant="link" isInline>
              <StatusIcon status="Error" className={spacing.mlXs} />
            </Button>
          </Popover>
        ) : null}
      </GridItem>
      <GridItem md={9} id="details-migration-type" aria-labelledby="migration-type-label">
        {planType ? 'warm' : 'cold'}
      </GridItem>
      <GridItem md={3} id="migration-type-label">
        Hooks
      </GridItem>
      {hooksDetails ? (
        <GridItem md={9} id="details-plan-hooks" aria-labelledby="migration-hooks-label">
          <div>
            <Grid>
              <GridItem span={5} id="migration-plan-hooks-steps-label">
                <Text className={text.fontWeightBold}>Migration step</Text>
                {hooksDetails.map((hookDetail) => (
                  <Text key={hookDetail.step}>
                    {hookDetail.step === 'PreHook' ? 'Pre-migration' : 'Post-migration'}
                  </Text>
                ))}
              </GridItem>
              <GridItem span={2} className="migration-hooks-align" />
              <GridItem span={5} id="migration-plan-hooks-definition-label">
                <Text className={text.fontWeightBold}>Definition</Text>
                {hooksDetails.map((hookDetails, idx) => (
                  <Text key={idx}>
                    {hookDetails.playbook ? 'Ansible playbook' : 'Custom container image'}
                  </Text>
                ))}
              </GridItem>
            </Grid>
          </div>
        </GridItem>
      ) : (
        <GridItem md={9} id="details-plan-hooks" aria-labelledby="migration-hooks-label">
          None
        </GridItem>
      )}
    </Grid>
  );
};

export default PlanDetails;
