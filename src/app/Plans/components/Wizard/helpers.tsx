import * as React from 'react';
import { TreeViewDataItem } from '@patternfly/react-core';
import { VMwareTree } from '@app/queries/types';
import { ClusterIcon, OutlinedHddIcon, FolderIcon } from '@patternfly/react-icons';

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
  const filteredChildren = ((children || []) as VMwareTree[]).filter(
    (node) =>
      node.kind !== 'VM' && // Don't show VMs in the tree
      (searchText === '' ||
        (node.object?.name || '').toLowerCase().includes(searchText.toLowerCase()))
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
