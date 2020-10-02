import * as React from 'react';
import { TreeViewDataItem } from '@patternfly/react-core';
import { VMwareTree } from '@app/queries/types';
import { ClusterIcon, OutlinedHddIcon, FolderIcon } from '@patternfly/react-icons';

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

export const getCompositeNodeId = (node: VMwareTree): string =>
  `${node.kind}/${node.object?.id || ''}`;

export const findMatchingNode = (node: VMwareTree, compositeId: string): VMwareTree | null => {
  if (getCompositeNodeId(node) === compositeId) return node;
  if (node?.children) {
    for (const i in node.children) {
      const found = findMatchingNode(node.children[i], compositeId);
      if (found) return found;
    }
  }
  return null;
};

const convertVMwareTreeNode = (
  node: VMwareTree,
  searchText: string,
  isNodeSelected: (node: VMwareTree) => boolean
): TreeViewDataItem => ({
  name: node.object?.name || '',
  id: getCompositeNodeId(node),
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

export const filterAndConvertVMwareTree = (
  rootNode: VMwareTree | null,
  searchText: string,
  isNodeSelected: (node: VMwareTree) => boolean
): TreeViewDataItem[] => {
  if (!rootNode) return [];
  return [
    {
      name: 'All datacenters',
      children: filterAndConvertVMwareTreeChildren(rootNode.children, searchText, isNodeSelected),
    },
  ];
};

export const flattenVMwareTreeNodes = (rootNode: VMwareTree | null): VMwareTree[] => {
  if (rootNode?.children) {
    const children = rootNode.children as VMwareTree[];
    return [...children, ...children.map(flattenVMwareTreeNodes)] as VMwareTree[];
  }
  return [];
};

export const getAllVMNodes = (nodes: VMwareTree[]): VMwareTree[] =>
  Array.from(
    new Set(
      (nodes.map((node) => {
        const thisNode = node.kind === 'VM' ? [node] : [];
        const childNodes = node.children ? getAllVMNodes(node.children) : [];
        return [...thisNode, ...childNodes];
      }) as unknown) as VMwareTree[]
    )
  );
