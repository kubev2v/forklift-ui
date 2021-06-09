import * as React from 'react';
import { TreeViewDataItem } from '@patternfly/react-core';
import {
  ICommonTreeObject,
  IHook,
  INameNamespaceRef,
  INetworkMapping,
  IPlan,
  SourceVM,
  IStorageMapping,
  IInventoryHostTree,
  ISourceVMConcern,
  IVMwareFolderTree,
  MappingSource,
  MappingType,
  InventoryTree,
  InventoryTreeType,
  IVMwareVM,
  IRHVVM,
} from '@app/queries/types';
import { ClusterIcon, OutlinedHddIcon, FolderIcon } from '@patternfly/react-icons';
import {
  getBuilderItemsFromMappingItems,
  getBuilderItemsWithMissingSources,
  getMappingFromBuilderItems,
} from '@app/Mappings/components/MappingBuilder/helpers';
import { PlanWizardFormState } from './PlanWizard';
import { CLUSTER_API_VERSION, META, ProviderType } from '@app/common/constants';
import {
  getAggregateQueryStatus,
  getFirstQueryError,
  isSameResource,
  nameAndNamespace,
} from '@app/queries/helpers';
import {
  findProvidersByRefs,
  useMappingResourceQueries,
  useInventoryProvidersQuery,
  useInventoryTreeQuery,
  useMappingsQuery,
  useHooksQuery,
  useSourceVMsQuery,
} from '@app/queries';
import { QueryResult, QueryStatus } from 'react-query';
import { StatusType } from '@konveyor/lib-ui';
import { PlanHookInstance } from './PlanAddEditHookModal';
import { IKubeList } from '@app/client/types';
import { getObjectRef } from '@app/common/helpers';

// Helper for filterAndConvertInventoryTree
const subtreeMatchesSearch = (node: InventoryTree, searchText: string) => {
  if (node.kind === 'VM') return false; // Exclude VMs from the tree entirely
  if (
    searchText === '' ||
    (node.object?.name || '').toLowerCase().includes(searchText.toLowerCase())
  ) {
    return true;
  }
  return node.children && node.children.some((child) => subtreeMatchesSearch(child, searchText));
};

const areSomeDescendantsSelected = (
  node: InventoryTree,
  isNodeSelected: (node: InventoryTree) => boolean
) => {
  if (isNodeSelected(node)) return true;
  if (node.children) {
    return node.children.some((child) => areSomeDescendantsSelected(child, isNodeSelected));
  }
  return false;
};

// Helper for filterAndConvertInventoryTree
const convertInventoryTreeNode = (
  node: InventoryTree,
  searchText: string,
  isNodeSelected: (node: InventoryTree) => boolean
): TreeViewDataItem => {
  const isPartiallyChecked =
    !isNodeSelected(node) && areSomeDescendantsSelected(node, isNodeSelected);
  return {
    name: node.object?.name || '',
    id: node.object?.selfLink,
    children: filterAndConvertInventoryTreeChildren(node.children, searchText, isNodeSelected),
    checkProps: {
      'aria-label': `Select ${node.kind} ${node.object?.name || ''}`,
      checked: isPartiallyChecked ? null : isNodeSelected(node),
    },
    icon:
      node.kind === 'Cluster' ? (
        <ClusterIcon />
      ) : node.kind === 'Host' ? (
        <OutlinedHddIcon />
      ) : node.kind === 'Folder' ? (
        <FolderIcon />
      ) : null,
  };
};

// Helper for filterAndConvertInventoryTree
const filterAndConvertInventoryTreeChildren = (
  children: InventoryTree[] | null,
  searchText: string,
  isNodeSelected: (node: InventoryTree) => boolean
): TreeViewDataItem[] | undefined => {
  const filteredChildren = ((children || []) as InventoryTree[]).filter((node) =>
    subtreeMatchesSearch(node, searchText)
  );
  if (filteredChildren.length > 0)
    return filteredChildren.map((node) =>
      convertInventoryTreeNode(node, searchText, isNodeSelected)
    );
  return undefined;
};

// Convert the API tree structure to the PF TreeView structure, while filtering by the user's search text.
export const filterAndConvertInventoryTree = (
  rootNode: InventoryTree | null,
  searchText: string,
  isNodeSelected: (node: InventoryTree) => boolean,
  areAllSelected: boolean
): TreeViewDataItem[] => {
  if (!rootNode) return [];
  const isPartiallyChecked =
    !areAllSelected && areSomeDescendantsSelected(rootNode, isNodeSelected);
  return [
    {
      name: 'All datacenters',
      id: 'converted-root',
      checkProps: {
        'aria-label': 'Select all datacenters',
        checked: isPartiallyChecked ? null : areAllSelected,
      },
      children: filterAndConvertInventoryTreeChildren(
        rootNode.children,
        searchText,
        isNodeSelected
      ),
    },
  ];
};

// To get the list of all available selectable nodes, we have to flatten the tree into a single array of nodes.
export const flattenVMwareTreeNodes = (rootNode: InventoryTree | null): InventoryTree[] => {
  if (rootNode?.children) {
    const children = (rootNode.children as InventoryTree[]).filter((node) => node.kind !== 'VM');
    return [...children, ...children.flatMap(flattenVMwareTreeNodes)];
  }
  return [];
};

// From the flattened selected nodes list, get all the unique VMs from all descendants of them.
export const getAllVMChildren = (nodes: InventoryTree[]): InventoryTree[] =>
  Array.from(
    new Set(nodes.flatMap((node) => node.children?.filter((node) => node.kind === 'VM') || []))
  );

export const getAvailableVMs = (
  selectedTreeNodes: InventoryTree[],
  allVMs: SourceVM[]
): SourceVM[] => {
  const treeVMs = getAllVMChildren(selectedTreeNodes)
    .map((node) => node.object)
    .filter((object) => !!object) as ICommonTreeObject[];
  const vmSelfLinks = treeVMs.map((object) => object.selfLink);
  return allVMs.filter((vm) => vmSelfLinks.includes(vm.selfLink));
};

// Given a tree and a vm, get a flattened breadcrumb of nodes from the root to the VM.
export const findVMTreePath = (node: InventoryTree, vmSelfLink: string): InventoryTree[] | null => {
  if (node.object?.selfLink === vmSelfLink) return [node];
  if (!node.children) return null;
  for (const i in node.children) {
    const childPath = findVMTreePath(node.children[i], vmSelfLink);
    if (childPath) return [node, ...childPath];
  }
  return null;
};

export interface IVMTreePathInfo {
  datacenter: ICommonTreeObject | null;
  cluster: ICommonTreeObject | null;
  host: ICommonTreeObject | null;
  folders: ICommonTreeObject[] | null;
  folderPathStr: string | null;
}

// Using the breadcrumbs for the VM in each tree, grab the column values for the Select VMs table.
export const findVMTreePathInfo = (
  vmSelfLink: string,
  hostTree: IInventoryHostTree | null,
  vmTree: IVMwareFolderTree | null
): IVMTreePathInfo => {
  if (!hostTree) {
    return {
      datacenter: null,
      cluster: null,
      host: null,
      folders: null,
      folderPathStr: null,
    };
  }
  const hostTreePath = findVMTreePath(hostTree, vmSelfLink);
  let folders: ICommonTreeObject[] = [];
  if (vmTree) {
    const vmTreePath = findVMTreePath(vmTree, vmSelfLink);
    folders =
      (vmTreePath
        ?.filter((node) => !!node && node.kind === 'Folder')
        .map((node) => node.object) as ICommonTreeObject[]) || null;
  }
  return {
    datacenter: hostTreePath?.find((node) => node.kind === 'Datacenter')?.object || null,
    cluster: hostTreePath?.find((node) => node.kind === 'Cluster')?.object || null,
    host: hostTreePath?.find((node) => node.kind === 'Host')?.object || null,
    folders,
    folderPathStr: folders?.map((folder) => folder.name).join('/') || null,
  };
};

export interface IVMTreePathInfoByVM {
  [vmSelfLink: string]: IVMTreePathInfo;
}

export const getVMTreePathInfoByVM = (
  vmSelfLinks: string[],
  hostTree: IInventoryHostTree | null,
  vmTree: IVMwareFolderTree | null
): IVMTreePathInfoByVM | null => {
  if (vmSelfLinks.length === 0) return null;
  return vmSelfLinks.reduce(
    (newObj, vmSelfLink) => ({
      ...newObj,
      [vmSelfLink]: findVMTreePathInfo(vmSelfLink, hostTree, vmTree),
    }),
    {}
  );
};

export const findMatchingNodeAndDescendants = (
  tree: InventoryTree | null,
  vmSelfLink: string
): InventoryTree[] => {
  const matchingPath = tree && findVMTreePath(tree, vmSelfLink);
  const matchingNode = matchingPath
    ?.slice()
    .reverse()
    .find((node) => node.kind !== 'VM');
  if (!matchingNode) return [];
  const nodeAndDescendants: InventoryTree[] = [];
  const pushNodeAndDescendants = (n: InventoryTree) => {
    nodeAndDescendants.push(n);
    if (n.children) {
      n.children.filter((node) => node.kind !== 'VM').forEach(pushNodeAndDescendants);
    }
  };
  pushNodeAndDescendants(matchingNode);
  return nodeAndDescendants;
};

export const findNodesMatchingSelectedVMs = (
  tree: InventoryTree | null,
  selectedVMs: SourceVM[]
): InventoryTree[] =>
  Array.from(
    new Set(selectedVMs.flatMap((vm) => findMatchingNodeAndDescendants(tree, vm.selfLink)))
  );

export const filterSourcesBySelectedVMs = (
  availableSources: MappingSource[],
  selectedVMs: SourceVM[],
  mappingType: MappingType,
  sourceProviderType: ProviderType
): MappingSource[] => {
  const sourceIds = Array.from(
    new Set(
      selectedVMs.flatMap((vm) => {
        if (mappingType === MappingType.Network) {
          if (sourceProviderType === 'vsphere') {
            return (vm as IVMwareVM).networks.map((network) => network.id);
          }
          if (sourceProviderType === 'ovirt') {
            return (vm as IRHVVM).nics.map((nic) => nic.profile.network);
          }
        }
        if (mappingType === MappingType.Storage) {
          if (sourceProviderType === 'vsphere') {
            return (vm as IVMwareVM).disks.map((disk) => disk.datastore.id);
          }
          if (sourceProviderType === 'ovirt') {
            return (vm as IRHVVM).diskAttachments.map((da) => da.disk.storageDomain);
          }
        }
        return [];
      })
    )
  );
  return availableSources.filter((source) => sourceIds.includes(source.id));
};

export const warmCriticalConcerns = ['Changed Block Tracking (CBT) not enabled'];

export const getMostSevereVMConcern = (vm: SourceVM): ISourceVMConcern | null => {
  if (!vm.concerns || vm.concerns.length === 0) {
    return null;
  }
  const critical = vm.concerns.find((concern) => concern.category === 'Critical');
  const warning = vm.concerns.find((concern) => concern.category === 'Warning');
  const advisory = vm.concerns.find(
    (concern) => concern.category === 'Information' || concern.category === 'Advisory'
  );
  if (critical) return critical;
  if (warning) return warning;
  if (advisory) return advisory;
  // Default to warning if an unexpected severity is found
  return { category: 'Warning', label: 'Unknown', assessment: '' };
};

export const getVMConcernStatusType = (concern: ISourceVMConcern | null): StatusType | null =>
  !concern
    ? 'Ok'
    : concern.category === 'Critical'
    ? 'Error'
    : concern.category === 'Warning'
    ? 'Warning'
    : concern.category === 'Information' || concern.category === 'Advisory'
    ? 'Info'
    : null;

export const getVMConcernStatusLabel = (concern: ISourceVMConcern | null): string =>
  concern?.category === 'Information' || concern?.category === 'Advisory'
    ? 'Advisory'
    : concern?.category || 'Ok';

export const someVMHasConcern = (vms: SourceVM[], concernLabel: string): boolean =>
  vms.some((vm) => vm.concerns.some((concern) => concern.label === concernLabel));

export interface IGenerateMappingsArgs {
  forms: PlanWizardFormState;
  generateName?: string;
  owner?: IPlan;
}

export const generateMappings = ({
  forms,
  generateName,
  owner,
}: IGenerateMappingsArgs): {
  networkMapping: INetworkMapping | null;
  storageMapping: IStorageMapping | null;
} => {
  const { sourceProvider, targetProvider } = forms.general.values;
  const existingMappingRefs = owner?.spec.map;
  const networkMapping =
    sourceProvider && targetProvider
      ? (getMappingFromBuilderItems({
          mappingType: MappingType.Network,
          mappingName:
            existingMappingRefs?.network.name || forms.networkMapping.values.newMappingName || null,
          generateName: generateName || null,
          owner,
          sourceProvider,
          targetProvider,
          builderItems: forms.networkMapping.values.builderItems,
        }) as INetworkMapping)
      : null;
  const storageMapping =
    sourceProvider && targetProvider
      ? (getMappingFromBuilderItems({
          mappingType: MappingType.Storage,
          mappingName:
            existingMappingRefs?.storage.name || forms.storageMapping.values.newMappingName || null,
          generateName: generateName || null,
          owner,
          sourceProvider,
          targetProvider,
          builderItems: forms.storageMapping.values.builderItems,
        }) as IStorageMapping)
      : null;
  return { networkMapping, storageMapping };
};

interface IHookRef {
  ref: INameNamespaceRef;
  instance: PlanHookInstance;
}

export const generatePlan = (
  forms: PlanWizardFormState,
  networkMappingRef: INameNamespaceRef,
  storageMappingRef: INameNamespaceRef,
  hooksRef?: IHookRef[]
): IPlan => ({
  apiVersion: CLUSTER_API_VERSION,
  kind: 'Plan',
  metadata: {
    name: forms.general.values.planName,
    namespace: META.namespace,
  },
  spec: {
    description: forms.general.values.planDescription,
    provider: {
      source: nameAndNamespace(forms.general.values.sourceProvider),
      destination: nameAndNamespace(forms.general.values.targetProvider),
    },
    targetNamespace: forms.general.values.targetNamespace,
    // Note: This assumes we will only ever allow migration networks that are in the target namespace.
    //       We may want to store migrationNetwork name/namespace in form state instead of just name.
    transferNetwork: forms.general.values.migrationNetwork
      ? {
          name: forms.general.values.migrationNetwork,
          namespace: forms.general.values.targetNamespace,
        }
      : null,
    map: {
      network: networkMappingRef,
      storage: storageMappingRef,
    },
    vms: hooksRef
      ? forms.selectVMs.values.selectedVMIds.map((id) => ({
          id,
          hooks: hooksRef.map((hookRef) => ({ hook: hookRef.ref, step: hookRef.instance.step })),
        }))
      : forms.selectVMs.values.selectedVMIds.map((id) => ({ id })),
    warm: forms.type.values.type === 'Warm',
  },
});

export const getSelectedVMsFromIds = (
  vmIds: string[],
  vmsQuery: QueryResult<SourceVM[]>
): SourceVM[] =>
  vmIds.flatMap((id) => {
    const matchingVM = vmsQuery.data?.find((vm) => vm.id === id);
    return matchingVM ? [matchingVM] : [];
  });

export const getSelectedVMsFromPlan = (
  planBeingEdited: IPlan | null,
  vmsQuery: QueryResult<SourceVM[]>
): SourceVM[] => {
  if (!planBeingEdited) return [];
  const vmIds = planBeingEdited.spec.vms.map(({ id }) => id);
  return getSelectedVMsFromIds(vmIds, vmsQuery);
};

interface IEditingPrefillResults {
  prefillQueryStatus: QueryStatus;
  prefillQueryError: unknown;
  isDonePrefilling: boolean;
  prefillQueries: QueryResult<unknown>[];
  prefillErrorTitles: string[];
}

export const useEditingPlanPrefillEffect = (
  forms: PlanWizardFormState,
  planBeingEdited: IPlan | null,
  isEditMode: boolean
): IEditingPrefillResults => {
  const providersQuery = useInventoryProvidersQuery();
  const { sourceProvider, targetProvider } = findProvidersByRefs(
    planBeingEdited?.spec.provider || null,
    providersQuery
  );
  const vmsQuery = useSourceVMsQuery(sourceProvider);
  const hostTreeQuery = useInventoryTreeQuery(sourceProvider, InventoryTreeType.Host);

  const networkMappingResourceQueries = useMappingResourceQueries(
    sourceProvider,
    targetProvider,
    MappingType.Network
  );
  const storageMappingResourceQueries = useMappingResourceQueries(
    sourceProvider,
    targetProvider,
    MappingType.Storage
  );

  const networkMappingsQuery = useMappingsQuery(MappingType.Network);
  const storageMappingsQuery = useMappingsQuery(MappingType.Storage);

  const hooksQuery = useHooksQuery();

  const queries = [
    providersQuery,
    vmsQuery,
    hostTreeQuery,
    ...networkMappingResourceQueries.queries,
    ...storageMappingResourceQueries.queries,
    networkMappingsQuery,
    storageMappingsQuery,
    hooksQuery,
  ];
  const errorTitles = [
    'Error loading providers',
    'Error loading VMs',
    'Error loading inventory tree data',
    'Error loading source networks',
    'Error loading target networks',
    'Error loading source storages',
    'Error loading target storage classes',
    'Error loading network mappings',
    'Error loading storage mappings',
    'Error loading hooks',
  ];

  const queryStatus = getAggregateQueryStatus(queries);
  const queryError = getFirstQueryError(queries);

  const [isStartedPrefilling, setIsStartedPrefilling] = React.useState(false);
  const [isDonePrefilling, setIsDonePrefilling] = React.useState(!isEditMode);
  React.useEffect(() => {
    if (!isStartedPrefilling && queryStatus === QueryStatus.Success && planBeingEdited) {
      setIsStartedPrefilling(true);
      const selectedVMs = getSelectedVMsFromPlan(planBeingEdited, vmsQuery);
      const selectedTreeNodes = findNodesMatchingSelectedVMs(
        hostTreeQuery.data || null,
        selectedVMs
      );
      const networkMapping = networkMappingsQuery.data?.items.find((mapping) =>
        isSameResource(mapping.metadata, planBeingEdited.spec.map.network)
      );
      const storageMapping = storageMappingsQuery.data?.items.find((mapping) =>
        isSameResource(mapping.metadata, planBeingEdited.spec.map.storage)
      );

      forms.general.fields.planName.setInitialValue(planBeingEdited.metadata.name);
      if (planBeingEdited.spec.description) {
        forms.general.fields.planDescription.setInitialValue(planBeingEdited.spec.description);
      }
      forms.general.fields.sourceProvider.setInitialValue(sourceProvider);
      forms.general.fields.targetProvider.setInitialValue(targetProvider);
      forms.general.fields.targetNamespace.setInitialValue(planBeingEdited.spec.targetNamespace);
      forms.general.fields.migrationNetwork.setInitialValue(
        planBeingEdited.spec.transferNetwork?.name || null
      );

      forms.filterVMs.fields.treeType.setInitialValue(InventoryTreeType.Host);
      forms.filterVMs.fields.selectedTreeNodes.setInitialValue(selectedTreeNodes);
      forms.filterVMs.fields.isPrefilled.setInitialValue(true);

      forms.selectVMs.fields.selectedVMIds.setInitialValue(selectedVMs.map((vm) => vm.id));

      forms.networkMapping.fields.builderItems.setInitialValue(
        getBuilderItemsWithMissingSources(
          getBuilderItemsFromMappingItems(
            networkMapping?.spec.map || [],
            MappingType.Network,
            networkMappingResourceQueries.availableSources,
            networkMappingResourceQueries.availableTargets
          ),
          networkMappingResourceQueries,
          selectedVMs,
          MappingType.Network,
          sourceProvider?.type || 'vsphere',
          false
        )
      );
      forms.networkMapping.fields.isPrefilled.setInitialValue(true);

      forms.storageMapping.fields.builderItems.setInitialValue(
        getBuilderItemsWithMissingSources(
          getBuilderItemsFromMappingItems(
            storageMapping?.spec.map || [],
            MappingType.Storage,
            storageMappingResourceQueries.availableSources,
            storageMappingResourceQueries.availableTargets
          ),
          storageMappingResourceQueries,
          selectedVMs,
          MappingType.Storage,
          sourceProvider?.type || 'vsphere',
          false
        )
      );
      forms.storageMapping.fields.isPrefilled.setInitialValue(true);

      forms.type.fields.type.setInitialValue(planBeingEdited.spec.warm ? 'Warm' : 'Cold');

      forms.hooks.fields.instances.setInitialValue(
        getPlanHookFormInstances(planBeingEdited, hooksQuery)
      );

      // Wait for effects to run based on field changes first
      window.setTimeout(() => {
        setIsDonePrefilling(true);
      }, 0);
    }
  }, [
    isStartedPrefilling,
    queryStatus,
    forms,
    planBeingEdited,
    sourceProvider,
    targetProvider,
    networkMappingResourceQueries,
    storageMappingResourceQueries,
    vmsQuery,
    hostTreeQuery,
    networkMappingsQuery,
    storageMappingsQuery,
    hooksQuery,
  ]);

  return {
    prefillQueryStatus: queryStatus,
    prefillQueryError: queryError,
    isDonePrefilling,
    prefillQueries: queries,
    prefillErrorTitles: errorTitles,
  };
};

export const concernMatchesFilter = (concern: ISourceVMConcern, filterText?: string): boolean =>
  !!filterText &&
  `${concern.label}: ${concern.assessment}`.toLowerCase().indexOf(filterText.toLowerCase()) !== -1;

export const vmMatchesConcernFilter = (vm: SourceVM, filterText?: string): boolean =>
  !!filterText && vm.concerns.some((concern) => concernMatchesFilter(concern, filterText));

export const generateHook = (
  instance: PlanHookInstance,
  existingHook: INameNamespaceRef | null,
  generateName?: string,
  owner?: IPlan
): IHook => ({
  apiVersion: CLUSTER_API_VERSION,
  kind: 'Hook',
  metadata: {
    ...(existingHook ? { name: existingHook.name } : { generateName: generateName || '' }),
    namespace: META.namespace,
    ...(owner ? { ownerReferences: [getObjectRef(owner)] } : {}),
  },
  spec: {
    ...(instance.type === 'playbook'
      ? { playbook: btoa(instance.playbook), image: 'quay.io/konveyor/hook-runner:latest' }
      : { image: instance.image }),
  },
});

export const getPlanHookFormInstances = (
  plan: IPlan,
  hooksQuery: QueryResult<IKubeList<IHook>>
): PlanHookInstance[] => {
  if (plan.spec.vms.length === 0) return [];
  const planHookRefs = plan.spec.vms[0].hooks || [];
  const hooksAllMatch = plan.spec.vms.every(
    (vm) =>
      (vm.hooks || []).length === planHookRefs.length &&
      (vm.hooks || []).every(
        (planHookRef) => !!planHookRefs.find((ref) => isSameResource(ref.hook, planHookRef.hook))
      )
  );
  if (!hooksAllMatch) {
    alert(`
      WARNING: This plan is not using the same hooks on all VMs.
      The API supports arbitrary hooks for each VM, but the UI only supports one set of hooks for all VMs.
      The hooks from the first VM in the plan will be used, and other hooks will be lost.
    `);
  }
  const instances: PlanHookInstance[] = [];
  planHookRefs.forEach((planHookRef) => {
    const matchingHook = (hooksQuery.data?.items || []).find((hook) =>
      isSameResource(hook.metadata, planHookRef.hook)
    );
    if (matchingHook) {
      instances.push({
        step: planHookRef.step,
        type: matchingHook.spec.playbook ? 'playbook' : 'image',
        playbook: atob(matchingHook.spec.playbook || ''),
        image: matchingHook.spec.playbook ? '' : matchingHook.spec.image || '',
        prefilledFromHook: matchingHook,
      });
    }
  });
  return instances;
};
