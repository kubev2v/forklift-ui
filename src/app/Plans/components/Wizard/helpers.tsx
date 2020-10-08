import * as React from 'react';
import { TreeViewDataItem } from '@patternfly/react-core';
import { ICommonTreeObject, IVMwareHostTree, IVMwareVMTree, VMwareTree } from '@app/queries/types';
import { ClusterIcon, OutlinedHddIcon, FolderIcon } from '@patternfly/react-icons';

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

export const getAvailableVMs = (selectedTreeNodes: VMwareTree[]): ICommonTreeObject[] =>
  getAllVMNodes(selectedTreeNodes)
    .map((node) => node.object)
    .filter((object) => !!object) as ICommonTreeObject[];

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
  vm: ICommonTreeObject,
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
  vms: ICommonTreeObject[],
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
