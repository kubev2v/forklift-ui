import { TreeViewDataItem } from '@patternfly/react-core';
import { IVM } from '../types/plans.types';

export let MOCK_VM_TREE: TreeViewDataItem[] = [];
export let MOCK_VMS: IVM[] = [];

// TODO put this condition back when we don't directly import mocks into components anymore
//if (process.env.NODE_ENV === 'test' || process.env.DATA_SOURCE === 'mock') {

// TODO this isn't a resource directly, write a helper to convert from tree objects to treeviewdataitems

MOCK_VM_TREE = [
  {
    name: 'All datacenters',
    id: 'all',
    checkProps: { 'aria-label': 'all-check', checked: false },
    children: [
      {
        name: 'datacenter 1',
        id: 'dc1',
        checkProps: { 'aria-label': 'dc1-check', checked: false },
        children: [
          {
            name: 'cluster 1',
            id: 'dc1cl1',
            checkProps: { 'aria-label': 'dc1cl1-check', checked: false },
            children: [
              {
                name: 'folder 1',
                id: 'dc1cl1dir1',
                checkProps: { 'aria-label': 'dc1cl1dir1-check', checked: false },
              },
              {
                name: 'folder 2',
                id: 'dc1cl1dir2',
                checkProps: { 'aria-label': 'dc1cl1dir2-check', checked: false },
              },
              {
                name: 'folder 3',
                id: 'dc1cl1dir3',
                checkProps: { 'aria-label': 'dc1cl1dir3-check', checked: false },
              },
            ],
          },
          {
            name: 'cluster 2',
            id: 'dc1cl2',
            checkProps: { 'aria-label': 'dc1cl2-check', checked: false },
            children: [
              {
                name: 'folder 1',
                id: 'dc1cl2dir1',
                checkProps: { 'aria-label': 'dc1cl2dir1-check', checked: false },
              },
            ],
          },
        ],
      },
      {
        name: 'datacenter 2',
        id: 'dc2',
        checkProps: { 'aria-label': 'dc2-check', checked: false },
        children: [
          {
            name: 'cluster 1',
            id: 'dc2cl1',
            checkProps: { 'aria-label': 'dc2cl1-check', checked: false },
            children: [
              {
                name: 'folder 1',
                id: 'dc2cl1dir1',
                checkProps: { 'aria-label': 'dc2cl1dir1-check', checked: false },
              },
            ],
          },
          {
            name: 'cluster 2',
            id: 'dc2cl2',
            checkProps: { 'aria-label': 'dc2cl2-check', checked: false },
            children: [
              {
                name: 'folder 1',
                id: 'dc2cl2dir1',
                checkProps: { 'aria-label': 'dc2cl2dir1-check', checked: false },
                children: [
                  {
                    name: 'folder A',
                    id: 'dc2cl2dir1dirA',
                    checkProps: { 'aria-label': 'dc2cl2dir1dirA-check', checked: false },
                  },
                  {
                    name: 'folder B',
                    id: 'dc2cl2dir1dirB',
                    checkProps: { 'aria-label': 'dc2cl2dir1dirB-check', checked: false },
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        name: 'datacenter 3',
        id: 'dc3',
        checkProps: { 'aria-label': 'dc3-check', checked: false },
        children: [
          {
            name: 'cluster 1',
            id: 'dc3cl1',
            checkProps: { 'aria-label': 'dc3cl1-check', checked: false },
            children: [
              {
                name: 'folder 1',
                id: 'dc3cl1dir1',
                checkProps: { 'aria-label': 'dc3cl1dir1-check', checked: false },
              },
              {
                name: 'folder 2',
                id: 'dc3cl1dir2',
                checkProps: { 'aria-label': 'dc3cl1dir2-check', checked: false },
              },
              {
                name: 'folder 3',
                id: 'dc3cl1dir3',
                checkProps: { 'aria-label': 'dc3cl1dir3-check', checked: false },
              },
            ],
          },
        ],
      },
    ],
    defaultExpanded: true,
  },
];

export const vm1: IVM = {
  name: 'vm1',
  datacenter: 'Prod center 1',
  cluster: 'Cluster 1',
  host: 'host test1',
  folderPath: 'folder1/folderb',
  migrationAnalysis: 'Ok',
  analysisDescription: 'No risk assessed',
};

export const vm2: IVM = {
  name: 'vm2',
  datacenter: 'Prod center 1',
  cluster: 'Cluster 1',
  host: 'host test1',
  folderPath: 'folder2/foldera',
  migrationAnalysis: 'Warning',
  analysisDescription: 'There is a risk because...',
};

MOCK_VMS = [vm1, vm2];
