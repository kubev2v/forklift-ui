import * as React from 'react';
import { TreeViewDataItem } from '@patternfly/react-core';
import {
  ICommonTreeObject,
  INetworkMapping,
  IPlan,
  IStorageMapping,
  IVMwareHostTree,
  IVMwareVM,
  IVMwareVMConcern,
  IVMwareVMTree,
  MappingSource,
  MappingType,
  VMwareTree,
  VMwareTreeType,
} from '@app/queries/types';
import { ClusterIcon, OutlinedHddIcon, FolderIcon } from '@patternfly/react-icons';
import {
  getBuilderItemsFromMappingItems,
  getBuilderItemsWithMissingSources,
  getMappingFromBuilderItems,
} from '@app/Mappings/components/MappingBuilder/helpers';
import { PlanWizardFormState } from './PlanWizard';
import { CLUSTER_API_VERSION, VIRT_META } from '@app/common/constants';
import {
  getAggregateQueryStatus,
  getFirstQueryError,
  nameAndNamespace,
} from '@app/queries/helpers';
import {
  findProvidersByRefs,
  useMappingResourceQueries,
  useProvidersQuery,
  useVMwareTreeQuery,
  useVMwareVMsQuery,
} from '@app/queries';
import { QueryResult, QueryStatus } from 'react-query';

// Helper for filterAndConvertVMwareTree
const subtreeMatchesSearch = (node: VMwareTree, searchText: string) => {
  if (node.kind === 'VM') return false; // Exclude VMs from the tree entirely
  if (
    searchText === '' ||
    (node.object?.name || '').toLowerCase().includes(searchText.toLowerCase())
  ) {
    return true;
  }
  return node.children && node.children.some((child) => subtreeMatchesSearch(child, searchText));
};

// Helper for filterAndConvertVMwareTree
const convertVMwareTreeNode = (
  node: VMwareTree,
  searchText: string,
  isNodeSelected: (node: VMwareTree) => boolean
): TreeViewDataItem => ({
  name: node.object?.name || '',
  id: node.object?.selfLink,
  children: filterAndConvertVMwareTreeChildren(node.children, searchText, isNodeSelected),
  checkProps: {
    'aria-label': `Select ${node.kind} ${node.object?.name || ''}`,
    checked: isNodeSelected(node),
  },
  icon:
    node.kind === 'Cluster' ? (
      <ClusterIcon />
    ) : node.kind === 'Host' ? (
      <OutlinedHddIcon />
    ) : node.kind === 'Folder' ? (
      <FolderIcon />
    ) : null,
});

// Helper for filterAndConvertVMwareTree
const filterAndConvertVMwareTreeChildren = (
  children: VMwareTree[] | null,
  searchText: string,
  isNodeSelected: (node: VMwareTree) => boolean
): TreeViewDataItem[] | undefined => {
  const filteredChildren = ((children || []) as VMwareTree[]).filter((node) =>
    subtreeMatchesSearch(node, searchText)
  );
  if (filteredChildren.length > 0)
    return filteredChildren.map((node) => convertVMwareTreeNode(node, searchText, isNodeSelected));
  return undefined;
};

// Convert the API tree structure to the PF TreeView structure, while filtering by the user's search text.
export const filterAndConvertVMwareTree = (
  rootNode: VMwareTree | null,
  searchText: string,
  isNodeSelected: (node: VMwareTree) => boolean,
  areAllSelected: boolean
): TreeViewDataItem[] => {
  if (!rootNode) return [];
  return [
    {
      name: 'All datacenters',
      id: 'converted-root',
      checkProps: {
        'aria-label': 'Select all datacenters',
        checked: areAllSelected,
      },
      children: filterAndConvertVMwareTreeChildren(rootNode.children, searchText, isNodeSelected),
    },
  ];
};

// To get the list of all available selectable nodes, we have to flatten the tree into a single array of nodes.
export const flattenVMwareTreeNodes = (rootNode: VMwareTree | null): VMwareTree[] => {
  if (rootNode?.children) {
    const children = rootNode.children as VMwareTree[];
    return [...children, ...children.flatMap(flattenVMwareTreeNodes)];
  }
  return [];
};

// From the flattened selected nodes list, get all the unique VMs from all descendants of them.
export const getAllVMNodes = (nodes: VMwareTree[]): VMwareTree[] =>
  Array.from(
    new Set(
      nodes.flatMap((node) => {
        const thisNode = node.kind === 'VM' ? [node] : [];
        const childNodes = node.children ? getAllVMNodes(node.children) : [];
        return [...thisNode, ...childNodes];
      })
    )
  );

export const getAvailableVMs = (
  selectedTreeNodes: VMwareTree[],
  allVMs: IVMwareVM[]
): IVMwareVM[] => {
  const treeVMs = getAllVMNodes(selectedTreeNodes)
    .map((node) => node.object)
    .filter((object) => !!object) as ICommonTreeObject[];
  const vmSelfLinks = treeVMs.map((object) => object.selfLink);
  return allVMs.filter((vm) => vmSelfLinks.includes(vm.selfLink));
};

// Given a tree and a vm, get a flattened breadcrumb of nodes from the root to the VM.
export const findVMTreePath = (node: VMwareTree, vmSelfLink: string): VMwareTree[] | null => {
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
  vm: IVMwareVM,
  hostTree: IVMwareHostTree | null,
  vmTree: IVMwareVMTree | null
): IVMTreePathInfo => {
  if (!hostTree || !vmTree) {
    return {
      datacenter: null,
      cluster: null,
      host: null,
      folders: null,
      folderPathStr: null,
    };
  }
  const hostTreePath = findVMTreePath(hostTree, vm.selfLink);
  const vmTreePath = findVMTreePath(vmTree, vm.selfLink);
  const folders =
    (vmTreePath
      ?.filter((node) => !!node && node.kind === 'Folder')
      .map((node) => node.object) as ICommonTreeObject[]) || null;
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
  vms: IVMwareVM[],
  hostTree: IVMwareHostTree | null,
  vmTree: IVMwareVMTree | null
): IVMTreePathInfoByVM =>
  vms.reduce(
    (newObj, vm) => ({
      ...newObj,
      [vm.selfLink]: findVMTreePathInfo(vm, hostTree, vmTree),
    }),
    {}
  );

export const findMatchingNodeAndDescendants = (
  tree: VMwareTree | null,
  vmSelfLink: string
): VMwareTree[] => {
  const matchingPath = tree && findVMTreePath(tree, vmSelfLink);
  const matchingNode = matchingPath
    ?.slice()
    .reverse()
    .find((node) => node.kind !== 'VM');
  if (!matchingNode) return [];
  const nodeAndDescendants: VMwareTree[] = [];
  const pushNodeAndDescendants = (n: VMwareTree) => {
    nodeAndDescendants.push(n);
    if (n.children) {
      n.children.forEach(pushNodeAndDescendants);
    }
  };
  pushNodeAndDescendants(matchingNode);
  return nodeAndDescendants;
};

export const findNodesMatchingSelectedVMs = (
  tree: VMwareTree | null,
  selectedVMs: IVMwareVM[]
): VMwareTree[] =>
  Array.from(
    new Set(selectedVMs.flatMap((vm) => findMatchingNodeAndDescendants(tree, vm.selfLink)))
  );

export const filterSourcesBySelectedVMs = (
  availableSources: MappingSource[],
  selectedVMs: IVMwareVM[],
  mappingType: MappingType
): MappingSource[] => {
  const sourceIds = Array.from(
    new Set(
      selectedVMs.flatMap((vm) => {
        if (mappingType === MappingType.Network) {
          return vm.networks.map((network) => network.ID);
        }
        if (mappingType === MappingType.Storage) {
          return vm.disks.map((disk) => disk.datastore.ID);
        }
        return [];
      })
    )
  );
  return availableSources.filter((source) => sourceIds.includes(source.id));
};

export const getMostSevereVMConcern = (vm: IVMwareVM): IVMwareVMConcern | null => {
  if (!vm.concerns || vm.concerns.length === 0) {
    return null;
  }
  const critical = vm.concerns.find((concern) => concern.severity === 'Critical');
  const warning = vm.concerns.find((concern) => concern.severity === 'Warning');
  const info = vm.concerns.find(
    (concern) => concern.severity === 'Info' || concern.severity === 'Advisory'
  );
  if (critical) return critical;
  if (warning) return warning;
  if (info) return info;
  // Default to warning if an unexpected severity is found
  return { severity: 'Warning', name: 'Unknown' };
};

export const generateMappings = (
  forms: PlanWizardFormState
): { networkMapping: INetworkMapping | null; storageMapping: IStorageMapping | null } => {
  const { sourceProvider, targetProvider } = forms.general.values;
  const networkMapping =
    sourceProvider && targetProvider
      ? (getMappingFromBuilderItems({
          mappingType: MappingType.Network,
          mappingName: forms.networkMapping.values.newMappingName || '',
          sourceProvider,
          targetProvider,
          builderItems: forms.networkMapping.values.builderItems,
        }) as INetworkMapping)
      : null;
  const storageMapping =
    sourceProvider && targetProvider
      ? (getMappingFromBuilderItems({
          mappingType: MappingType.Storage,
          mappingName: forms.storageMapping.values.newMappingName || '',
          sourceProvider,
          targetProvider,
          builderItems: forms.storageMapping.values.builderItems,
        }) as IStorageMapping)
      : null;
  return { networkMapping, storageMapping };
};

export const generatePlan = (
  forms: PlanWizardFormState,
  networkMapping: INetworkMapping | null,
  storageMapping: IStorageMapping | null
): IPlan => ({
  apiVersion: CLUSTER_API_VERSION,
  kind: 'Plan',
  metadata: {
    name: forms.general.values.planName,
    namespace: VIRT_META.namespace,
  },
  spec: {
    description: forms.general.values.planDescription,
    provider: {
      source: nameAndNamespace(forms.general.values.sourceProvider),
      destination: nameAndNamespace(forms.general.values.targetProvider),
    },
    targetNamespace: forms.general.values.targetNamespace,
    map: {
      networks: networkMapping?.spec.map || [],
      datastores: storageMapping?.spec.map || [],
    },
    vms: forms.selectVMs.values.selectedVMs.map((vm) => ({ id: vm.id })),
  },
});

export const getSelectedVMsFromPlan = (
  planBeingEdited: IPlan | null,
  vmsQuery: QueryResult<IVMwareVM[]>
): IVMwareVM[] => {
  if (!planBeingEdited) return [];
  return planBeingEdited.spec.vms
    .map(({ id }) => vmsQuery.data?.find((vm) => vm.id === id))
    .filter((vm) => !!vm) as IVMwareVM[];
};

interface IEditingPrefillResults {
  prefillQueryStatus: QueryStatus;
  prefillQueryError: unknown;
  isDonePrefilling: boolean;
}

export const useEditingPrefillEffect = (
  forms: PlanWizardFormState,
  planBeingEdited: IPlan | null,
  isEditMode: boolean
): IEditingPrefillResults => {
  const [isDonePrefilling, setIsDonePrefilling] = React.useState(!isEditMode);

  const providersQuery = useProvidersQuery();
  const { sourceProvider, targetProvider } = findProvidersByRefs(
    planBeingEdited?.spec.provider || null,
    providersQuery
  );
  const vmsQuery = useVMwareVMsQuery(sourceProvider);
  const hostTreeQuery = useVMwareTreeQuery(sourceProvider, VMwareTreeType.Host);
  const vmTreeQuery = useVMwareTreeQuery(sourceProvider, VMwareTreeType.VM);

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

  const queries = [
    providersQuery,
    vmsQuery,
    hostTreeQuery,
    vmTreeQuery,
    ...networkMappingResourceQueries.queries,
    ...storageMappingResourceQueries.queries,
  ];
  const queryStatus = getAggregateQueryStatus(queries);
  const queryError = getFirstQueryError(queries);

  React.useEffect(() => {
    if (queryStatus === QueryStatus.Success && !forms.isSomeFormDirty && planBeingEdited) {
      const selectedVMs = getSelectedVMsFromPlan(planBeingEdited, vmsQuery);
      const treeQuery =
        forms.filterVMs.values.treeType === VMwareTreeType.Host ? hostTreeQuery : vmTreeQuery;
      const selectedTreeNodes = findNodesMatchingSelectedVMs(treeQuery.data || null, selectedVMs);

      forms.general.fields.planName.setValue(planBeingEdited.metadata.name);
      forms.general.fields.planName.setIsTouched(true);
      if (planBeingEdited.spec.description) {
        forms.general.fields.planDescription.setValue(planBeingEdited.spec.description);
        forms.general.fields.planDescription.setIsTouched(true);
      }
      forms.general.fields.sourceProvider.setValue(sourceProvider);
      forms.general.fields.sourceProvider.setIsTouched(true);
      forms.general.fields.targetProvider.setValue(targetProvider);
      forms.general.fields.targetProvider.setIsTouched(true);
      forms.general.fields.targetNamespace.setValue(planBeingEdited.spec.targetNamespace);
      forms.general.fields.targetNamespace.setIsTouched(true);

      forms.filterVMs.fields.selectedTreeNodes.setValue(selectedTreeNodes);
      forms.filterVMs.fields.selectedTreeNodes.setIsTouched(true);
      forms.filterVMs.fields.isPrefilled.setValue(true);

      forms.selectVMs.fields.selectedVMs.setValue(selectedVMs);
      forms.selectVMs.fields.selectedVMs.setIsTouched(true);

      forms.networkMapping.fields.builderItems.setValue(
        getBuilderItemsWithMissingSources(
          getBuilderItemsFromMappingItems(
            planBeingEdited.spec.map.networks,
            MappingType.Network,
            networkMappingResourceQueries.availableSources,
            networkMappingResourceQueries.availableTargets
          ),
          networkMappingResourceQueries,
          selectedVMs,
          MappingType.Network,
          false
        )
      );
      forms.networkMapping.fields.builderItems.setIsTouched(true);
      forms.networkMapping.fields.isPrefilled.setValue(true);

      forms.storageMapping.fields.builderItems.setValue(
        getBuilderItemsWithMissingSources(
          getBuilderItemsFromMappingItems(
            planBeingEdited.spec.map.datastores,
            MappingType.Storage,
            storageMappingResourceQueries.availableSources,
            storageMappingResourceQueries.availableTargets
          ),
          storageMappingResourceQueries,
          selectedVMs,
          MappingType.Storage,
          false
        )
      );
      forms.storageMapping.fields.builderItems.setIsTouched(true);
      forms.storageMapping.fields.isPrefilled.setValue(true);

      // Wait for effects to run based on field changes first
      window.setTimeout(() => {
        setIsDonePrefilling(true);
      }, 0);
    }
  }, [
    queryStatus,
    forms,
    planBeingEdited,
    sourceProvider,
    targetProvider,
    networkMappingResourceQueries,
    storageMappingResourceQueries,
    vmsQuery,
    hostTreeQuery,
    vmTreeQuery,
  ]);

  return {
    prefillQueryStatus: queryStatus,
    prefillQueryError: queryError,
    isDonePrefilling,
  };
};
