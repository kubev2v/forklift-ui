import { IVMwareHostTree, IVMwareVMTree } from '../types/tree.types';

export let MOCK_VMWARE_HOST_TREE: IVMwareHostTree = {
  kind: '',
  object: null,
  children: null,
};

export let MOCK_VMWARE_VM_TREE: IVMwareVMTree = {
  kind: '',
  object: null,
  children: null,
};

if (process.env.NODE_ENV === 'test' || process.env.DATA_SOURCE === 'mock') {
  MOCK_VMWARE_HOST_TREE = {
    kind: '',
    object: null,
    children: [
      {
        kind: 'Datacenter',
        object: {
          id: '',
          parent: null,
          name: 'Fake_DC',
          selfLink: '/providers/vsphere/test4/datacenters/datacenter-2760',
        },
        children: null,
      },
      {
        kind: 'Datacenter',
        object: {
          id: '',
          parent: null,
          name: 'V2V-DC',
          selfLink: '/providers/vsphere/test4/datacenters/datacenter-21',
        },
        children: [
          {
            kind: 'Cluster',
            object: {
              id: 'domain-c26',
              parent: {
                kind: 'Folder',
                id: 'group-h23',
              },
              name: 'V2V_Cluster',
              selfLink: '/providers/vsphere/test4/clusters/domain-c26',
            },
            children: [
              {
                kind: 'Host',
                object: {
                  id: 'host-29',
                  parent: {
                    kind: 'Cluster',
                    id: 'domain-c26',
                  },
                  name: 'esx13.v2v.bos.redhat.com',
                  selfLink: '/providers/vsphere/test4/hosts/host-29',
                },
                children: [
                  {
                    kind: 'VM',
                    object: {
                      id: 'vm-1630',
                      parent: { kind: 'Folder', id: 'group-v22' },
                      name: 'fdupont-test-migration',
                      selfLink: '/providers/vsphere/test/vms/vm-1630',
                    },
                    children: null,
                  },
                  {
                    kind: 'VM',
                    object: {
                      id: 'vm-template-test',
                      parent: { kind: 'Folder', id: 'group-v22' },
                      name: 'vm-template-test',
                      selfLink: '/providers/vsphere/test/vms/vm-template-test',
                    },
                    children: null,
                  },
                  {
                    kind: 'VM',
                    object: {
                      id: 'vm-2844',
                      parent: { kind: 'Folder', id: 'group-v22' },
                      name: 'fdupont%2ftest',
                      selfLink: '/providers/vsphere/test/vms/vm-2844',
                    },
                    children: null,
                  },
                  {
                    kind: 'VM',
                    object: {
                      id: 'vm-1008',
                      parent: { kind: 'Folder', id: 'group-v22' },
                      name: 'fdupont-test-migration-centos',
                      selfLink: '/providers/vsphere/test/vms/vm-1008',
                    },
                    children: null,
                  },
                  {
                    kind: 'VM',
                    object: {
                      id: 'vm-2685',
                      parent: { kind: 'Folder', id: 'group-v22' },
                      name: 'pemcg-discovery01',
                      selfLink: '/providers/vsphere/test/vms/vm-2685',
                    },
                    children: null,
                  },
                  {
                    kind: 'VM',
                    object: {
                      id: 'vm-431',
                      parent: { kind: 'Folder', id: 'group-v22' },
                      name: 'pemcg-iscsi-target',
                      selfLink: '/providers/vsphere/test/vms/vm-431',
                    },
                    children: null,
                  },
                ],
              },
            ],
          },
          {
            kind: 'Cluster',
            object: {
              id: 'domain-c2758',
              parent: {
                kind: 'Folder',
                id: 'group-h23',
              },
              name: 'Fake_Cluster',
              selfLink: '/providers/vsphere/test4/clusters/domain-c2758',
            },
            children: null,
          },
          {
            kind: 'Folder',
            object: {
              id: 'group-h2800',
              parent: {
                kind: 'Folder',
                id: 'group-h23',
              },
              name: 'jortel',
              selfLink: '/providers/vsphere/test4/folders/group-h2800',
            },
            children: null,
          },
        ],
      },
    ],
  };

  MOCK_VMWARE_VM_TREE = {
    kind: '',
    object: null,
    children: [
      {
        kind: 'Datacenter',
        object: {
          id: 'datacenter-2760',
          parent: {
            kind: 'Folder',
            id: 'group-d1',
          },
          name: 'Fake_DC',
          selfLink: '/providers/vsphere/test4/datacenters/datacenter-2760',
        },
        children: null,
      },
      {
        kind: 'Datacenter',
        object: {
          id: 'datacenter-21',
          parent: {
            kind: 'Folder',
            id: 'group-d1',
          },
          name: 'V2V-DC',
          selfLink: '/providers/vsphere/test4/datacenters/datacenter-21',
        },
        children: [
          {
            kind: 'VM',
            object: {
              id: 'vm-1630',
              parent: { kind: 'Folder', id: 'group-v22' },
              name: 'fdupont-test-migration',
              selfLink: '/providers/vsphere/test/vms/vm-1630',
            },
            children: null,
          },
          {
            kind: 'VM',
            object: {
              id: 'vm-template-test',
              parent: { kind: 'Folder', id: 'group-v22' },
              name: 'vm-template-test',
              selfLink: '/providers/vsphere/test/vms/vm-template-test',
            },
            children: null,
          },
          {
            kind: 'VM',
            object: {
              id: 'vm-2844',
              parent: { kind: 'Folder', id: 'group-v22' },
              name: 'fdupont%2ftest',
              selfLink: '/providers/vsphere/test/vms/vm-2844',
            },
            children: null,
          },
          {
            kind: 'VM',
            object: {
              id: 'vm-1008',
              parent: { kind: 'Folder', id: 'group-v22' },
              name: 'fdupont-test-migration-centos',
              selfLink: '/providers/vsphere/test/vms/vm-1008',
            },
            children: null,
          },
          {
            kind: 'VM',
            object: {
              id: 'vm-2685',
              parent: { kind: 'Folder', id: 'group-v22' },
              name: 'pemcg-discovery01',
              selfLink: '/providers/vsphere/test/vms/vm-2685',
            },
            children: null,
          },
          {
            kind: 'VM',
            object: {
              id: 'vm-431',
              parent: { kind: 'Folder', id: 'group-v22' },
              name: 'pemcg-iscsi-target',
              selfLink: '/providers/vsphere/test/vms/vm-431',
            },
            children: null,
          },
          {
            kind: 'Folder',
            object: {
              id: 'group-v1001',
              parent: {
                kind: 'Folder',
                id: 'group-v22',
              },
              name: 'Workloads',
              selfLink: '/providers/vsphere/test4/folders/group-v1001',
            },
            children: [
              {
                kind: 'VM',
                object: {
                  id: 'vm-1630',
                  parent: { kind: 'Folder', id: 'group-v22' },
                  name: 'fdupont-test-migration',
                  selfLink: '/providers/vsphere/test/vms/vm-1630',
                },
                children: null,
              },
              {
                kind: 'VM',
                object: {
                  id: 'vm-template-test',
                  parent: { kind: 'Folder', id: 'group-v22' },
                  name: 'vm-template-test',
                  selfLink: '/providers/vsphere/test/vms/vm-template-test',
                },
                children: null,
              },
              {
                kind: 'VM',
                object: {
                  id: 'vm-2844',
                  parent: { kind: 'Folder', id: 'group-v22' },
                  name: 'fdupont%2ftest',
                  selfLink: '/providers/vsphere/test/vms/vm-2844',
                },
                children: null,
              },
              {
                kind: 'VM',
                object: {
                  id: 'vm-1008',
                  parent: { kind: 'Folder', id: 'group-v22' },
                  name: 'fdupont-test-migration-centos',
                  selfLink: '/providers/vsphere/test/vms/vm-1008',
                },
                children: null,
              },
              {
                kind: 'Folder',
                object: {
                  id: 'vm-2685',
                  parent: { kind: 'Folder', id: 'group-v22' },
                  name: 'pemcg-discovery01',
                  selfLink: '/providers/vsphere/test/vms/vm-2685',
                },
                children: null,
              },
              {
                kind: 'Folder',
                object: {
                  id: 'group-v2831',
                  parent: {
                    kind: 'Folder',
                    id: 'group-v1001',
                  },
                  name: 'Linux',
                  selfLink: '/providers/vsphere/test4/folders/group-v2831',
                },
                children: [
                  {
                    kind: 'VM',
                    object: {
                      id: 'vm-1630',
                      parent: { kind: 'Folder', id: 'group-v22' },
                      name: 'fdupont-test-migration',
                      selfLink: '/providers/vsphere/test/vms/vm-1630',
                    },
                    children: null,
                  },
                  {
                    kind: 'VM',
                    object: {
                      id: 'vm-template-test',
                      parent: { kind: 'Folder', id: 'group-v22' },
                      name: 'vm-template-test',
                      selfLink: '/providers/vsphere/test/vms/vm-template-test',
                    },
                    children: null,
                  },
                  {
                    kind: 'VM',
                    object: {
                      id: 'vm-2844',
                      parent: { kind: 'Folder', id: 'group-v22' },
                      name: 'fdupont%2ftest',
                      selfLink: '/providers/vsphere/test/vms/vm-2844',
                    },
                    children: null,
                  },
                ],
              },
              {
                kind: 'Folder',
                object: {
                  id: 'group-v2835',
                  parent: {
                    kind: 'Folder',
                    id: 'group-v1001',
                  },
                  name: 'jortel',
                  selfLink: '/providers/vsphere/test4/folders/group-v2835',
                },
                children: [
                  {
                    kind: 'VM',
                    object: {
                      id: 'vm-1630',
                      parent: { kind: 'Folder', id: 'group-v22' },
                      name: 'fdupont-test-migration',
                      selfLink: '/providers/vsphere/test/vms/vm-1630',
                    },
                    children: null,
                  },
                  {
                    kind: 'VM',
                    object: {
                      id: 'vm-template-test',
                      parent: { kind: 'Folder', id: 'group-v22' },
                      name: 'vm-template-test',
                      selfLink: '/providers/vsphere/test/vms/vm-template-test',
                    },
                    children: null,
                  },
                  {
                    kind: 'Folder',
                    object: {
                      id: 'group-v2837',
                      parent: {
                        kind: 'Folder',
                        id: 'group-v2835',
                      },
                      name: 'Test',
                      selfLink: '/providers/vsphere/test4/folders/group-v2837',
                    },
                    children: [
                      {
                        kind: 'Folder',
                        object: {
                          id: 'group-v2838',
                          parent: {
                            kind: 'Folder',
                            id: 'group-v2837',
                          },
                          name: 'jortel',
                          selfLink: '/providers/vsphere/test4/folders/group-v2838',
                        },
                        children: null,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            kind: 'Folder',
            object: {
              id: 'group-v162',
              parent: {
                kind: 'Folder',
                id: 'group-v22',
              },
              name: 'v2v dev',
              selfLink: '/providers/vsphere/test4/folders/group-v162',
            },
            children: [
              {
                kind: 'VM',
                object: {
                  id: 'vm-1630',
                  parent: { kind: 'Folder', id: 'group-v22' },
                  name: 'fdupont-test-migration',
                  selfLink: '/providers/vsphere/test/vms/vm-1630',
                },
                children: null,
              },
              {
                kind: 'VM',
                object: {
                  id: 'vm-template-test',
                  parent: { kind: 'Folder', id: 'group-v22' },
                  name: 'vm-template-test',
                  selfLink: '/providers/vsphere/test/vms/vm-template-test',
                },
                children: null,
              },
              {
                kind: 'VM',
                object: {
                  id: 'vm-2844',
                  parent: { kind: 'Folder', id: 'group-v22' },
                  name: 'fdupont%2ftest',
                  selfLink: '/providers/vsphere/test/vms/vm-2844',
                },
                children: null,
              },
              {
                kind: 'VM',
                object: {
                  id: 'vm-1008',
                  parent: { kind: 'Folder', id: 'group-v22' },
                  name: 'fdupont-test-migration-centos',
                  selfLink: '/providers/vsphere/test/vms/vm-1008',
                },
                children: null,
              },
            ],
          },
          {
            kind: 'Folder',
            object: {
              id: 'group-v72',
              parent: {
                kind: 'Folder',
                id: 'group-v22',
              },
              name: 'Templates',
              selfLink: '/providers/vsphere/test4/folders/group-v72',
            },
            children: [
              {
                kind: 'VM',
                object: {
                  id: 'vm-1630',
                  parent: { kind: 'Folder', id: 'group-v22' },
                  name: 'fdupont-test-migration',
                  selfLink: '/providers/vsphere/test/vms/vm-1630',
                },
                children: null,
              },
              {
                kind: 'VM',
                object: {
                  id: 'vm-template-test',
                  parent: { kind: 'Folder', id: 'group-v22' },
                  name: 'vm-template-test',
                  selfLink: '/providers/vsphere/test/vms/vm-template-test',
                },
                children: null,
              },
              {
                kind: 'VM',
                object: {
                  id: 'vm-2844',
                  parent: { kind: 'Folder', id: 'group-v22' },
                  name: 'fdupont%2ftest',
                  selfLink: '/providers/vsphere/test/vms/vm-2844',
                },
                children: null,
              },
              {
                kind: 'VM',
                object: {
                  id: 'vm-1008',
                  parent: { kind: 'Folder', id: 'group-v22' },
                  name: 'fdupont-test-migration-centos',
                  selfLink: '/providers/vsphere/test/vms/vm-1008',
                },
                children: null,
              },
            ],
          },
          {
            kind: 'Folder',
            object: {
              id: 'group-v39',
              parent: {
                kind: 'Folder',
                id: 'group-v22',
              },
              name: 'V2V',
              selfLink: '/providers/vsphere/test4/folders/group-v39',
            },
            children: [
              {
                kind: 'VM',
                object: {
                  id: 'vm-1630',
                  parent: { kind: 'Folder', id: 'group-v22' },
                  name: 'fdupont-test-migration',
                  selfLink: '/providers/vsphere/test/vms/vm-1630',
                },
                children: null,
              },
              {
                kind: 'VM',
                object: {
                  id: 'vm-template-test',
                  parent: { kind: 'Folder', id: 'group-v22' },
                  name: 'vm-template-test',
                  selfLink: '/providers/vsphere/test/vms/vm-template-test',
                },
                children: null,
              },
              {
                kind: 'VM',
                object: {
                  id: 'vm-2844',
                  parent: { kind: 'Folder', id: 'group-v22' },
                  name: 'fdupont%2ftest',
                  selfLink: '/providers/vsphere/test/vms/vm-2844',
                },
                children: null,
              },
            ],
          },
          {
            kind: 'Folder',
            object: {
              id: 'group-v38',
              parent: {
                kind: 'Folder',
                id: 'group-v22',
              },
              name: 'Infrastructure',
              selfLink: '/providers/vsphere/test4/folders/group-v38',
            },
            children: [
              {
                kind: 'VM',
                object: {
                  id: 'vm-1630',
                  parent: { kind: 'Folder', id: 'group-v22' },
                  name: 'fdupont-test-migration',
                  selfLink: '/providers/vsphere/test/vms/vm-1630',
                },
                children: null,
              },
              {
                kind: 'VM',
                object: {
                  id: 'vm-template-test',
                  parent: { kind: 'Folder', id: 'group-v22' },
                  name: 'vm-template-test',
                  selfLink: '/providers/vsphere/test/vms/vm-template-test',
                },
                children: null,
              },
            ],
          },
          {
            kind: 'Folder',
            object: {
              id: 'group-v28',
              parent: {
                kind: 'Folder',
                id: 'group-v22',
              },
              name: 'Discovered virtual machine',
              selfLink: '/providers/vsphere/test4/folders/group-v28',
            },
            children: null,
          },
        ],
      },
    ],
  };
}
