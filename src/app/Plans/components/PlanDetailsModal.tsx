import * as React from 'react';

import {
  IHook,
  IMetaObjectMeta,
  IPlan,
  MappingType,
  SourceInventoryProvider,
} from '@app/queries/types';
import {
  useInventoryProvidersQuery,
  useMappingsQuery,
  useResourceQueriesForMapping,
  useHooksQuery,
  useSourceVMsQuery,
} from '@app/queries';
import { usePausedPollingEffect } from '@app/common/context';
import { ResolvedQueries } from '@app/common/components/ResolvedQuery';
import { isSameResource } from '@app/queries/helpers';
import PlanDetails from './PlanDetails';
import { SOURCE_PROVIDER_TYPES } from '@app/common/constants';

interface IPlanDetailsModalProps {
  plan: IPlan;
}

const PlanDetailsModal: React.FunctionComponent<IPlanDetailsModalProps> = ({
  plan,
}: IPlanDetailsModalProps) => {
  usePausedPollingEffect();

  const networkMappings = useMappingsQuery(MappingType.Network);
  const networkMapping =
    networkMappings.data?.items.find((mapping) =>
      isSameResource(mapping.metadata as IMetaObjectMeta, plan.spec.map.network)
    ) || null;

  const storageMappings = useMappingsQuery(MappingType.Storage);
  const storageMapping =
    storageMappings.data?.items.find((mapping) =>
      isSameResource(mapping.metadata as IMetaObjectMeta, plan.spec.map.storage)
    ) || null;

  const providers = useInventoryProvidersQuery();
  const allProviders = providers.data
    ? (SOURCE_PROVIDER_TYPES.flatMap((key) => providers.data[key]) as SourceInventoryProvider[])
    : [];
  const provider =
    allProviders.find((provider) => isSameResource(provider, plan.spec.provider.source)) || null;

  const vms = useSourceVMsQuery(provider);
  const selectedVMs =
    vms.data?.filter((vm) => plan.spec.vms.find((planVM) => planVM.id === vm.id)) || [];

  const hooks = useHooksQuery();
  const selectedHooks =
    hooks.data?.items.filter((hook) =>
      plan.spec.vms.find((vm) =>
        vm.hooks?.find(
          (VMHook) =>
            VMHook.hook.name === (hook.metadata as IMetaObjectMeta).name &&
            VMHook.hook.namespace === (hook.metadata as IMetaObjectMeta).namespace
        )
      )
    ) || [];

  const isPlaybook = (hooks: IHook[], name: string): boolean => {
    const hook = hooks.find((hook) => (hook.metadata as IMetaObjectMeta).name === name);
    return hook?.spec.playbook ? true : false;
  };

  const networkMappingResources = useResourceQueriesForMapping(MappingType.Network, networkMapping);
  const storageMappingResources = useResourceQueriesForMapping(MappingType.Storage, storageMapping);
  const mappingResourceQueryErrors = [
    'Could not load providers',
    'Could not load source provider resources',
    'Could not load target provider resources',
  ];

  return (
    <ResolvedQueries
      results={[
        networkMappings,
        storageMappings,
        providers,
        vms,
        ...networkMappingResources.queries,
        ...storageMappingResources.queries,
      ]}
      errorTitles={[
        'Could not load network mappings',
        'Could not load storage mappings',
        'Could not load providers',
        'Could not load VMs',
        ...mappingResourceQueryErrors,
        ...mappingResourceQueryErrors,
      ]}
    >
      <PlanDetails
        plan={plan}
        sourceProvider={provider}
        networkMapping={networkMapping}
        storageMapping={storageMapping}
        vms={selectedVMs}
        hooksDetails={
          plan.spec.vms[0].hooks?.map((hook) => ({
            step: hook.step,
            playbook: isPlaybook(selectedHooks, hook.hook.name),
          })) || null
        }
      />
    </ResolvedQueries>
  );
};

export default PlanDetailsModal;
