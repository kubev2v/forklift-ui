import * as React from 'react';
import { TreeViewDataItem } from '@patternfly/react-core';
import { VMwareTree } from '@app/queries/types';
import { ClusterIcon, OutlinedHddIcon, FolderIcon } from '@patternfly/react-icons';

const convertVMwareTreeNode = (node: VMwareTree): TreeViewDataItem => ({
  name: node.object?.name || '',
  children: convertVMwareTreeChildren(node.children),
  icon:
    node.kind === 'Cluster' ? (
      <ClusterIcon />
    ) : node.kind === 'Host' ? (
      <OutlinedHddIcon />
    ) : node.kind === 'Folder' ? (
      <FolderIcon />
    ) : null,
});

const convertVMwareTreeChildren = (
  children: VMwareTree[] | null
): TreeViewDataItem[] | undefined => {
  // Don't show VMs in the tree
  const filteredChildren = ((children || []) as VMwareTree[]).filter((node) => node.kind !== 'VM');
  if (filteredChildren.length > 0) return filteredChildren.map(convertVMwareTreeNode);
  return undefined;
};

export const convertVMwareTree = (rootNode: VMwareTree | null): TreeViewDataItem[] =>
  rootNode
    ? [{ name: 'All datacenters', children: convertVMwareTreeChildren(rootNode.children) }]
    : [];
