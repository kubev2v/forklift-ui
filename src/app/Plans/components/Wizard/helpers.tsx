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

const convertVMwareTreeNode = (node: VMwareTree, searchText: string): TreeViewDataItem => ({
  name: node.object?.name || '',
  children: filterAndConvertVMwareTreeChildren(node.children, searchText),
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
  searchText: string
): TreeViewDataItem[] | undefined => {
  const filteredChildren = ((children || []) as VMwareTree[]).filter((node) =>
    subtreeMatchesSearch(node, searchText)
  );
  if (filteredChildren.length > 0)
    return filteredChildren.map((node) => convertVMwareTreeNode(node, searchText));
  return undefined;
};

export const filterAndConvertVMwareTree = (
  rootNode: VMwareTree | null,
  searchText: string
): TreeViewDataItem[] => {
  if (!rootNode) return [];
  return [
    {
      name: 'All datacenters',
      children: filterAndConvertVMwareTreeChildren(rootNode.children, searchText),
    },
  ];
};
