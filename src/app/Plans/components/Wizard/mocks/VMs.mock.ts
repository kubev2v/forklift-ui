import { IVMs } from '../../../types';

export const VMsOptions = [
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

export const MOCK_VMS: IVMs[] = [
  {
    Name: 'vm1',
    Datacenter: 'Prod center 1',
    Cluster: 'Cluster 1',
    Host: 'host test1',
    FolderPath: 'folder1/folderb',
    MigrationAnalysis: 'Ok',
    MAStory: '',
  },
  {
    Name: 'vm2',
    Datacenter: 'Prod center 1',
    Cluster: 'Cluster 1',
    Host: 'host test1',
    FolderPath: 'folder2/foldera',
    MigrationAnalysis: 'Warning',
    MAStory: 'There is a risk because...',
  },
];
