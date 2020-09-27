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
          name: '',
          selfLink:
            '/namespaces/openshift-migration/providers/vsphere/test4/datacenters/datacenter-2760',
        },
        children: null,
      },
      {
        kind: 'Datacenter',
        object: {
          id: '',
          parent: null,
          name: '',
          selfLink:
            '/namespaces/openshift-migration/providers/vsphere/test4/datacenters/datacenter-21',
        },
        children: [
          {
            kind: 'Cluster',
            object: {
              id: 'domain-c26',
              parent: {
                Kind: 'Folder',
                ID: 'group-h23',
              },
              name: 'V2V_Cluster',
              selfLink:
                '/namespaces/openshift-migration/providers/vsphere/test4/clusters/domain-c26',
            },
            children: [
              {
                kind: 'Host',
                object: {
                  id: 'host-29',
                  parent: {
                    Kind: 'Cluster',
                    ID: 'domain-c26',
                  },
                  name: 'esx13.v2v.bos.redhat.com',
                  selfLink: '/namespaces/openshift-migration/providers/vsphere/test4/hosts/host-29',
                },
                children: [
                  {
                    kind: 'VM',
                    object: {
                      id: 'vm-2781',
                      parent: {
                        Kind: 'Folder',
                        ID: 'group-v22',
                      },
                      name: 'marnold-mtv',
                      selfLink:
                        '/namespaces/openshift-migration/providers/vsphere/test4/vms/vm-2781',
                    },
                    children: null,
                  },
                  {
                    kind: 'VM',
                    object: {
                      id: 'vm-2782',
                      parent: {
                        Kind: 'Folder',
                        ID: 'group-v22',
                      },
                      name: 'slucidi-import-test',
                      selfLink:
                        '/namespaces/openshift-migration/providers/vsphere/test4/vms/vm-2782',
                    },
                    children: null,
                  },
                  {
                    kind: 'VM',
                    object: {
                      id: 'vm-2695',
                      parent: {
                        Kind: 'Folder',
                        ID: 'group-v22',
                      },
                      name: 'pemcg-cfme-5.11.5.2',
                      selfLink:
                        '/namespaces/openshift-migration/providers/vsphere/test4/vms/vm-2695',
                    },
                    children: null,
                  },
                  {
                    kind: 'VM',
                    object: {
                      id: 'vm-2051',
                      parent: {
                        Kind: 'Folder',
                        ID: 'group-v22',
                      },
                      name: 'pemcg-fred-test01',
                      selfLink:
                        '/namespaces/openshift-migration/providers/vsphere/test4/vms/vm-2051',
                    },
                    children: null,
                  },
                  {
                    kind: 'VM',
                    object: {
                      id: 'vm-1617',
                      parent: {
                        Kind: 'Folder',
                        ID: 'group-v22',
                      },
                      name: 'pemcg-cfme-5-stable',
                      selfLink:
                        '/namespaces/openshift-migration/providers/vsphere/test4/vms/vm-1617',
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
                Kind: 'Folder',
                ID: 'group-h23',
              },
              name: 'Fake_Cluster',
              selfLink:
                '/namespaces/openshift-migration/providers/vsphere/test4/clusters/domain-c2758',
            },
            children: null,
          },
          {
            kind: 'Folder',
            object: {
              id: 'group-h2800',
              parent: {
                Kind: 'Folder',
                ID: 'group-h23',
              },
              name: 'jortel',
              selfLink:
                '/namespaces/openshift-migration/providers/vsphere/test4/folders/group-h2800',
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
            Kind: 'Folder',
            ID: 'group-d1',
          },
          name: 'Fake_DC',
          selfLink:
            '/namespaces/openshift-migration/providers/vsphere/test4/datacenters/datacenter-2760',
        },
        children: null,
      },
      {
        kind: 'Datacenter',
        object: {
          id: 'datacenter-21',
          parent: {
            Kind: 'Folder',
            ID: 'group-d1',
          },
          name: 'V2V-DC',
          selfLink:
            '/namespaces/openshift-migration/providers/vsphere/test4/datacenters/datacenter-21',
        },
        children: [
          {
            kind: 'VM',
            object: {
              id: 'vm-2782',
              parent: {
                Kind: 'Folder',
                ID: 'group-v22',
              },
              name: 'slucidi-import-test',
              selfLink: '/namespaces/openshift-migration/providers/vsphere/test4/vms/vm-2782',
            },
            children: null,
          },
          {
            kind: 'VM',
            object: {
              id: 'vm-2695',
              parent: {
                Kind: 'Folder',
                ID: 'group-v22',
              },
              name: 'pemcg-cfme-5.11.5.2',
              selfLink: '/namespaces/openshift-migration/providers/vsphere/test4/vms/vm-2695',
            },
            children: null,
          },
          {
            kind: 'VM',
            object: {
              id: 'vm-2051',
              parent: {
                Kind: 'Folder',
                ID: 'group-v22',
              },
              name: 'pemcg-fred-test01',
              selfLink: '/namespaces/openshift-migration/providers/vsphere/test4/vms/vm-2051',
            },
            children: null,
          },
          {
            kind: 'VM',
            object: {
              id: 'vm-1617',
              parent: {
                Kind: 'Folder',
                ID: 'group-v22',
              },
              name: 'pemcg-cfme-5-stable',
              selfLink: '/namespaces/openshift-migration/providers/vsphere/test4/vms/vm-1617',
            },
            children: null,
          },
          {
            kind: 'VM',
            object: {
              id: 'vm-2492',
              parent: {
                Kind: 'Folder',
                ID: 'group-v22',
              },
              name: 'pemcg-cfme-5.11.5.0',
              selfLink: '/namespaces/openshift-migration/providers/vsphere/test4/vms/vm-2492',
            },
            children: null,
          },
          {
            kind: 'Folder',
            object: {
              id: 'group-v1001',
              parent: {
                Kind: 'Folder',
                ID: 'group-v22',
              },
              name: 'Workloads',
              selfLink:
                '/namespaces/openshift-migration/providers/vsphere/test4/folders/group-v1001',
            },
            children: [
              {
                kind: 'VM',
                object: {
                  id: 'vm-1005',
                  parent: {
                    Kind: 'Folder',
                    ID: 'group-v1001',
                  },
                  name: 'Brett - oracle_weblogic',
                  selfLink: '/namespaces/openshift-migration/providers/vsphere/test4/vms/vm-1005',
                },
                children: null,
              },
              {
                kind: 'VM',
                object: {
                  id: 'vm-1155',
                  parent: {
                    Kind: 'Folder',
                    ID: 'group-v1001',
                  },
                  name: 'Brett - mssql',
                  selfLink: '/namespaces/openshift-migration/providers/vsphere/test4/vms/vm-1155',
                },
                children: null,
              },
              {
                kind: 'VM',
                object: {
                  id: 'vm-1158',
                  parent: {
                    Kind: 'Folder',
                    ID: 'group-v1001',
                  },
                  name: 'Brett - Windows_MSSQL',
                  selfLink: '/namespaces/openshift-migration/providers/vsphere/test4/vms/vm-1158',
                },
                children: null,
              },
              {
                kind: 'Folder',
                object: {
                  id: 'group-v2830',
                  parent: {
                    Kind: 'Folder',
                    ID: 'group-v1001',
                  },
                  name: 'Windows',
                  selfLink:
                    '/namespaces/openshift-migration/providers/vsphere/test4/folders/group-v2830',
                },
                children: null,
              },
              {
                kind: 'Folder',
                object: {
                  id: 'group-v2831',
                  parent: {
                    Kind: 'Folder',
                    ID: 'group-v1001',
                  },
                  name: 'Linux',
                  selfLink:
                    '/namespaces/openshift-migration/providers/vsphere/test4/folders/group-v2831',
                },
                children: [
                  {
                    kind: 'VM',
                    object: {
                      id: 'vm-2696',
                      parent: {
                        Kind: 'Folder',
                        ID: 'group-v2831',
                      },
                      name: 'pemcg-betty-test01',
                      selfLink:
                        '/namespaces/openshift-migration/providers/vsphere/test4/vms/vm-2696',
                    },
                    children: null,
                  },
                  {
                    kind: 'VM',
                    object: {
                      id: 'vm-2050',
                      parent: {
                        Kind: 'Folder',
                        ID: 'group-v2831',
                      },
                      name: 'pemcg-barney-test01',
                      selfLink:
                        '/namespaces/openshift-migration/providers/vsphere/test4/vms/vm-2050',
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
                    Kind: 'Folder',
                    ID: 'group-v1001',
                  },
                  name: 'jortel',
                  selfLink:
                    '/namespaces/openshift-migration/providers/vsphere/test4/folders/group-v2835',
                },
                children: [
                  {
                    kind: 'VM',
                    object: {
                      id: 'vm-2765',
                      parent: {
                        Kind: 'Folder',
                        ID: 'group-v2835',
                      },
                      name: 'jortel-testing',
                      selfLink:
                        '/namespaces/openshift-migration/providers/vsphere/test4/vms/vm-2765',
                    },
                    children: null,
                  },
                  {
                    kind: 'Folder',
                    object: {
                      id: 'group-v2837',
                      parent: {
                        Kind: 'Folder',
                        ID: 'group-v2835',
                      },
                      name: 'Test',
                      selfLink:
                        '/namespaces/openshift-migration/providers/vsphere/test4/folders/group-v2837',
                    },
                    children: [
                      {
                        kind: 'Folder',
                        object: {
                          id: 'group-v2838',
                          parent: {
                            Kind: 'Folder',
                            ID: 'group-v2837',
                          },
                          name: 'jortel',
                          selfLink:
                            '/namespaces/openshift-migration/providers/vsphere/test4/folders/group-v2838',
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
                Kind: 'Folder',
                ID: 'group-v22',
              },
              name: 'v2v dev',
              selfLink:
                '/namespaces/openshift-migration/providers/vsphere/test4/folders/group-v162',
            },
            children: [
              {
                kind: 'VM',
                object: {
                  id: 'vm-66',
                  parent: {
                    Kind: 'Folder',
                    ID: 'group-v162',
                  },
                  name: 'brett-dev-windows-server-2012',
                  selfLink: '/namespaces/openshift-migration/providers/vsphere/test4/vms/vm-66',
                },
                children: null,
              },
              {
                kind: 'VM',
                object: {
                  id: 'vm-155',
                  parent: {
                    Kind: 'Folder',
                    ID: 'group-v162',
                  },
                  name: 'Brett - dev-windows-server-2016',
                  selfLink: '/namespaces/openshift-migration/providers/vsphere/test4/vms/vm-155',
                },
                children: null,
              },
              {
                kind: 'VM',
                object: {
                  id: 'vm-156',
                  parent: {
                    Kind: 'Folder',
                    ID: 'group-v162',
                  },
                  name: 'Brett - dev-windows-server-2008',
                  selfLink: '/namespaces/openshift-migration/providers/vsphere/test4/vms/vm-156',
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
                Kind: 'Folder',
                ID: 'group-v22',
              },
              name: 'Templates',
              selfLink: '/namespaces/openshift-migration/providers/vsphere/test4/folders/group-v72',
            },
            children: [
              {
                kind: 'VM',
                object: {
                  id: 'vm-996',
                  parent: {
                    Kind: 'Folder',
                    ID: 'group-v72',
                  },
                  name: 'pemcg-rhel8-template-master',
                  selfLink: '/namespaces/openshift-migration/providers/vsphere/test4/vms/vm-996',
                },
                children: null,
              },
              {
                kind: 'VM',
                object: {
                  id: 'vm-74',
                  parent: {
                    Kind: 'Folder',
                    ID: 'group-v72',
                  },
                  name: 'DSL-128M-Template',
                  selfLink: '/namespaces/openshift-migration/providers/vsphere/test4/vms/vm-74',
                },
                children: null,
              },
              {
                kind: 'VM',
                object: {
                  id: 'vm-1002',
                  parent: {
                    Kind: 'Folder',
                    ID: 'group-v72',
                  },
                  name: 'tpl_centos7',
                  selfLink: '/namespaces/openshift-migration/providers/vsphere/test4/vms/vm-1002',
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
                Kind: 'Folder',
                ID: 'group-v22',
              },
              name: 'V2V',
              selfLink: '/namespaces/openshift-migration/providers/vsphere/test4/folders/group-v39',
            },
            children: [
              {
                kind: 'VM',
                object: {
                  id: 'vm-69',
                  parent: {
                    Kind: 'Folder',
                    ID: 'group-v39',
                  },
                  name: 'Brett - Wingtips',
                  selfLink: '/namespaces/openshift-migration/providers/vsphere/test4/vms/vm-69',
                },
                children: null,
              },
              {
                kind: 'VM',
                object: {
                  id: 'vm-2834',
                  parent: {
                    Kind: 'Folder',
                    ID: 'group-v39',
                  },
                  name: 'Vince',
                  selfLink: '/namespaces/openshift-migration/providers/vsphere/test4/vms/vm-2834',
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
                Kind: 'Folder',
                ID: 'group-v22',
              },
              name: 'Infrastructure',
              selfLink: '/namespaces/openshift-migration/providers/vsphere/test4/folders/group-v38',
            },
            children: [
              {
                kind: 'VM',
                object: {
                  id: 'vm-32',
                  parent: {
                    Kind: 'Folder',
                    ID: 'group-v38',
                  },
                  name: 'vCenter Server',
                  selfLink: '/namespaces/openshift-migration/providers/vsphere/test4/vms/vm-32',
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
                Kind: 'Folder',
                ID: 'group-v22',
              },
              name: 'Discovered virtual machine',
              selfLink: '/namespaces/openshift-migration/providers/vsphere/test4/folders/group-v28',
            },
            children: null,
          },
        ],
      },
    ],
  };
}
