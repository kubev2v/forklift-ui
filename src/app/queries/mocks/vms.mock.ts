import { IVMwareVM, IRHVVM } from '../types/vms.types';

export let MOCK_VMWARE_VMS: IVMwareVM[] = [];
export let MOCK_RHV_VMS: IRHVVM[] = [];

if (process.env.NODE_ENV === 'test' || process.env.DATA_SOURCE === 'mock') {
  MOCK_VMWARE_VMS = [
    {
      id: 'vm-1630',
      revision: 1,
      parent: { kind: 'Folder', id: 'group-v22' },
      name: 'fdupont-test-migration',
      selfLink: '/providers/vsphere/test/vms/vm-1630',
      uuid: '42251a15-2353-990c-66dc-e8a406a0b97b',
      firmware: 'bios',
      cpuAffinity: [],
      cpuHostAddEnabled: false,
      cpuHostRemoveEnabled: false,
      memoryHotAddEnabled: false,
      cpuCount: 1,
      coresPerSocket: 1,
      memoryMB: 2048,
      guestName: 'Red Hat Enterprise Linux 7 (64-bit)',
      balloonedMemory: 0,
      ipAddress: '',
      networks: [{ kind: 'Network', id: '1' }],
      disks: [
        {
          file: '[datastore13] fdupont-test-migration/fdupont-test-migration.vmdk',
          datastore: { kind: 'Datastore', id: '1' },
        },
        {
          file: '[datastore13] fdupont-test-migration/fdupont-test-migration_1.vmdk',
          datastore: { kind: 'Datastore', id: '1' },
        },
      ],
      concerns: [
        {
          category: 'Warning',
          label: 'Shareable disk detected',
          assessment:
            'Shared disks are only supported by certain OpenShift Virtualization storage configurations. Ensure that the correct storage is selected for the disk.',
        },
        {
          category: 'Warning',
          label: 'VM running in HA-enabled cluster',
          assessment:
            'Host/Node HA is not currently supported by OpenShift Virtualization. The VM can be migrated but it will not have this feature in the target environment.',
        },
        {
          category: 'Information',
          label: 'VM running in a DRS-enabled cluster',
          assessment:
            'Distributed resource scheduling is not currently supported by OpenShift Virtualization. The VM can be migrated but it will not have this feature in the target environment.',
        },
        {
          category: 'Information',
          label: 'VM snapshot detected',
          assessment: 'Warm migration may not be possible for this VM',
        },
      ],
      revisionValidated: 1,
      isTemplate: false,
    },
    {
      id: 'vm-2844',
      revision: 1,
      parent: { kind: 'Folder', id: 'group-v22' },
      name: 'fdupont-test',
      selfLink: '/providers/vsphere/test/vms/vm-2844',
      uuid: '422558fb-928d-8eed-a06c-5aacfb4a4fb6',
      firmware: 'bios',
      cpuAffinity: [],
      cpuHostAddEnabled: false,
      cpuHostRemoveEnabled: false,
      memoryHotAddEnabled: false,
      cpuCount: 1,
      coresPerSocket: 1,
      memoryMB: 2048,
      guestName: 'Red Hat Enterprise Linux 7 (64-bit)',
      balloonedMemory: 0,
      ipAddress: '',
      networks: [{ kind: 'Network', id: '1' }],
      disks: [
        {
          file: '[NFS_Datastore] fdupont%2ftest/fdupont%2ftest.vmdk',
          datastore: { kind: 'Datastore', id: '2' },
        },
      ],
      concerns: [
        { category: 'Information', label: 'Example', assessment: 'You should know something' },
      ],
      revisionValidated: 1,
      isTemplate: false,
    },
    {
      id: 'vm-1008',
      revision: 1,
      parent: { kind: 'Folder', id: 'group-v22' },
      name: 'fdupont-test-migration-centos',
      selfLink: '/providers/vsphere/test/vms/vm-1008',
      uuid: '4225792d-5266-11c5-87b9-ad69243f86ef',
      firmware: 'bios',
      cpuAffinity: [],
      cpuHostAddEnabled: false,
      cpuHostRemoveEnabled: false,
      memoryHotAddEnabled: false,
      cpuCount: 1,
      coresPerSocket: 1,
      memoryMB: 2048,
      guestName: 'CentOS 4/5 or later (64-bit)',
      balloonedMemory: 0,
      ipAddress: '',
      networks: [
        { kind: 'Network', id: '1' },
        { kind: 'Network', id: '2' },
      ],
      disks: [
        {
          file: '[datastore13] fdupont-test-migration-centos/fdupont-test-migration-centos.vmdk',
          datastore: { kind: 'Datastore', id: '1' },
        },
      ],
      concerns: [
        { category: 'Critical', label: 'Example', assessment: 'Something is really bad' },
        {
          category: 'Warning',
          label: 'Changed Block Tracking (CBT) not enabled',
          assessment:
            'Changed Block Tracking (CBT) has not been enabled on this VM. This feature is a prerequisite for VM warm migration.',
        },
      ],
      revisionValidated: 1,
      isTemplate: false,
    },
    {
      id: 'vm-2685',
      revision: 2,
      parent: { kind: 'Folder', id: 'group-v22' },
      name: 'pemcg-discovery01',
      selfLink: '/providers/vsphere/test/vms/vm-2685',
      uuid: '4225bf92-306a-15ee-c3ad-cb39a6f815bb',
      firmware: 'bios',
      cpuAffinity: [],
      cpuHostAddEnabled: false,
      cpuHostRemoveEnabled: false,
      memoryHotAddEnabled: false,
      cpuCount: 4,
      coresPerSocket: 2,
      memoryMB: 4096,
      guestName: 'Red Hat Enterprise Linux 7 (64-bit)',
      balloonedMemory: 0,
      ipAddress: '',
      networks: [{ kind: 'Network', id: '1' }],
      disks: [
        {
          file: '[NFS_Datastore] pemcg-discovery01/pemcg-discovery01.vmdk',
          datastore: { kind: 'Datastore', id: '2' },
        },
      ],
      concerns: [{ category: 'Warning', label: 'Example', assessment: 'Something is wrong' }],
      revisionValidated: 1,
      isTemplate: false,
    },
    {
      id: 'vm-431',
      revision: 1,
      parent: { kind: 'Folder', id: 'group-v22' },
      name: 'pemcg-iscsi-target',
      selfLink: '/providers/vsphere/test/vms/vm-431',
      uuid: '42256329-8c3a-2a82-54fd-01d845a8bf49',
      firmware: 'bios',
      cpuAffinity: [0, 2],
      cpuHostAddEnabled: true,
      cpuHostRemoveEnabled: false,
      memoryHotAddEnabled: false,
      cpuCount: 2,
      coresPerSocket: 1,
      memoryMB: 2048,
      guestName: 'Red Hat Enterprise Linux 7 (64-bit)',
      balloonedMemory: 0,
      ipAddress: '',
      networks: [
        { kind: 'Network', id: '1' },
        { kind: 'Network', id: 'network-33' },
      ],
      disks: [
        {
          file: '[iSCSI_Datastore] pemcg-iscsi-target/pemcg-iscsi-target.vmdk',
          datastore: { kind: 'Datastore', id: '3' },
        },
        {
          file: '[iSCSI_Datastore] pemcg-iscsi-target/pemcg-iscsi-target_1.vmdk',
          datastore: { kind: 'Datastore', id: '3' },
        },
      ],
      concerns: [],
      revisionValidated: 1,
      isTemplate: false,
    },
  ];

  MOCK_VMWARE_VMS.push({
    ...MOCK_VMWARE_VMS[0],
    id: 'vm-template-test',
    name: 'vm-template-test',
    selfLink: '/providers/vsphere/test/vms/vm-template-test',
    uuid: 'vm-template-test',
    isTemplate: true,
  });

  MOCK_RHV_VMS = [
    {
      id: '3dcaf3ec-6b51-4ca0-8345-6d61841731d7',
      revision: 1,
      name: 'fdupont-cfme-5.11.9.0-1',
      description: '',
      selfLink:
        'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/vms/3dcaf3ec-6b51-4ca0-8345-6d61841731d7',
      cluster: '3053b92e-23eb-11e8-959c-00163e18b6f7',
      host: 'c75a349c-a429-4afc-83cc-44fbd6447758',
      revisionValidated: 0,
      guestName: 'Red Hat Enterprise Linux 8.2',
      nics: [
        {
          id: '0a1d34bd-f80a-4791-9961-786226a700a4',
          name: 'nic1',
          interface: 'virtio',
          profile: {
            id: 'b3503925-6dec-4f66-9af7-1b2d594dc706',
            revision: 1,
            name: 'VM_DHCP_Network',
            description: '',
            selfLink:
              'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/nicprofiles/b3503925-6dec-4f66-9af7-1b2d594dc706',
            network: '1',
            qos: '',
          },
        },
      ],
      diskAttachments: [
        {
          id: '9769618b-92a2-4995-8e90-8ad008d9ebe8',
          disk: {
            id: '9769618b-92a2-4995-8e90-8ad008d9ebe8',
            revision: 1,
            name: 'fdupont-cfme-5.11.9.0-1_Disk1',
            description: '',
            selfLink:
              'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/disks/9769618b-92a2-4995-8e90-8ad008d9ebe8',
            shared: false,
            profile: '3157288e-3429-42fc-87f7-75e92621268a',
            storageDomain: '1',
          },
        },
        {
          id: '40adf335-105e-4faf-bbc9-18c9cf6843ce',
          disk: {
            id: '40adf335-105e-4faf-bbc9-18c9cf6843ce',
            revision: 1,
            name: 'fdupont-cfme-5.11.9.0-1_Disk2',
            description: '',
            selfLink:
              'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/disks/40adf335-105e-4faf-bbc9-18c9cf6843ce',
            shared: false,
            profile: '3157288e-3429-42fc-87f7-75e92621268a',
            storageDomain: '1',
          },
        },
      ],
      concerns: [],
    },
    {
      id: '2a66a719-440c-4544-9da0-692d14338b12',
      revision: 1,
      name: 'fdupont-dev-rhel8',
      description: '',
      selfLink:
        'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/vms/2a66a719-440c-4544-9da0-692d14338b12',
      cluster: '3053b92e-23eb-11e8-959c-00163e18b6f7',
      host: 'c75a349c-a429-4afc-83cc-44fbd6447758',
      revisionValidated: 0,
      guestName: 'Red Hat Enterprise Linux 8.2',
      nics: [
        {
          id: '6df33c4b-b88d-46c1-b72f-bcccce94f310',
          name: 'nic1',
          interface: 'virtio',
          profile: {
            id: '0000000a-000a-000a-000a-000000000398',
            revision: 1,
            name: 'ovirtmgmt',
            description: '',
            selfLink:
              'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/nicprofiles/0000000a-000a-000a-000a-000000000398',
            network: '2',
            qos: '',
          },
        },
      ],
      diskAttachments: [
        {
          id: 'b749c132-bb97-4145-b86e-a1751cf75e21',
          disk: {
            id: 'b749c132-bb97-4145-b86e-a1751cf75e21',
            revision: 1,
            name: 'fdupont-dev-rhel8_Disk1',
            description: '',
            selfLink:
              'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/disks/b749c132-bb97-4145-b86e-a1751cf75e21',
            shared: false,
            profile: '3157288e-3429-42fc-87f7-75e92621268a',
            storageDomain: '1',
          },
        },
      ],
      concerns: [],
    },
    {
      id: '64333a40-ffbb-4c28-add7-5560bdf082fb',
      revision: 1,
      name: 'fdupont-manageiq-dev',
      description: '',
      selfLink:
        'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/vms/64333a40-ffbb-4c28-add7-5560bdf082fb',
      cluster: '3053b92e-23eb-11e8-959c-00163e18b6f7',
      host: 'c75a349c-a429-4afc-83cc-44fbd6447758',
      revisionValidated: 0,
      guestName: 'CentOS Linux 8',
      nics: [
        {
          id: '5439243e-37ec-4e98-ad16-8dcc1b86038e',
          name: 'nic1',
          interface: 'virtio',
          profile: {
            id: 'b3503925-6dec-4f66-9af7-1b2d594dc706',
            revision: 1,
            name: 'VM_DHCP_Network',
            description: '',
            selfLink:
              'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/nicprofiles/b3503925-6dec-4f66-9af7-1b2d594dc706',
            network: '1',
            qos: '',
          },
        },
      ],
      diskAttachments: [
        {
          id: 'ac7b501c-edbb-4804-b06b-de58e1d67579',
          disk: {
            id: 'ac7b501c-edbb-4804-b06b-de58e1d67579',
            revision: 1,
            name: 'fdupont-manageiq-dev_Disk1',
            description: '',
            selfLink:
              'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/disks/ac7b501c-edbb-4804-b06b-de58e1d67579',
            shared: false,
            profile: '911d97de-3e80-40ee-b3f2-81783bea4d6b',
            storageDomain: '2',
          },
        },
      ],
      concerns: [],
    },
    {
      id: '6f9de857-ef39-43b7-8853-af982286dc59',
      revision: 1,
      name: 'jenkins-me.v2v.bos.redhat.com',
      description: '',
      selfLink:
        'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/vms/6f9de857-ef39-43b7-8853-af982286dc59',
      cluster: '3053b92e-23eb-11e8-959c-00163e18b6f7',
      host: 'c75a349c-a429-4afc-83cc-44fbd6447758',
      revisionValidated: 0,
      guestName: 'Red Hat Enterprise Linux Server 7.9',
      nics: [
        {
          id: '4ace22d9-dd14-4225-a9ed-11b0a1bb71c1',
          name: 'nic1',
          interface: 'virtio',
          profile: {
            id: '3831100d-bda9-475d-bfc3-6890b9b10f74',
            revision: 1,
            name: 'VM_Network',
            description: '',
            selfLink:
              'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/nicprofiles/3831100d-bda9-475d-bfc3-6890b9b10f74',
            network: '3',
            qos: '',
          },
        },
      ],
      diskAttachments: [
        {
          id: 'c666f4a0-ce9b-4e2b-825c-54f0093b2b11',
          disk: {
            id: 'c666f4a0-ce9b-4e2b-825c-54f0093b2b11',
            revision: 1,
            name: 'jenkins-me.v2v.bos.redhat.com_Docker',
            description: 'Docker Disk',
            selfLink:
              'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/disks/c666f4a0-ce9b-4e2b-825c-54f0093b2b11',
            shared: false,
            profile: '3157288e-3429-42fc-87f7-75e92621268a',
            storageDomain: '1',
          },
        },
        {
          id: 'dfdf133d-a757-4d01-bc9d-4cc4a5dd6e31',
          disk: {
            id: 'dfdf133d-a757-4d01-bc9d-4cc4a5dd6e31',
            revision: 1,
            name: 'jenkins-me.v2v.bos.redhat.com_Disk1',
            description: '',
            selfLink:
              'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/disks/dfdf133d-a757-4d01-bc9d-4cc4a5dd6e31',
            shared: false,
            profile: '911d97de-3e80-40ee-b3f2-81783bea4d6b',
            storageDomain: '2',
          },
        },
        {
          id: '52f84502-3bd1-4ac5-9107-fb7629cc2fdd',
          disk: {
            id: '52f84502-3bd1-4ac5-9107-fb7629cc2fdd',
            revision: 1,
            name: 'jenkins-me.v2v.bos.redhat.com_Jenkins_data',
            description: 'Jenkins data disk',
            selfLink:
              'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/disks/52f84502-3bd1-4ac5-9107-fb7629cc2fdd',
            shared: false,
            profile: '3157288e-3429-42fc-87f7-75e92621268a',
            storageDomain: '1',
          },
        },
      ],
      concerns: [],
    },
    {
      id: 'bea5f184-972e-44e2-811a-2357829ab590',
      revision: 1,
      name: 'demo-cfme-5.11.7.3-1',
      description: '',
      selfLink:
        'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/vms/bea5f184-972e-44e2-811a-2357829ab590',
      cluster: '3053b92e-23eb-11e8-959c-00163e18b6f7',
      host: '1b71b05f-ad57-4568-a3b0-83672d125ad8',
      revisionValidated: 0,
      guestName: 'Red Hat Enterprise Linux 8.2',
      nics: [
        {
          id: '0ad57043-84d4-4c30-9faa-435a30d7abd1',
          name: 'nic1',
          interface: 'virtio',
          profile: {
            id: 'b3503925-6dec-4f66-9af7-1b2d594dc706',
            revision: 1,
            name: 'VM_DHCP_Network',
            description: '',
            selfLink:
              'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/nicprofiles/b3503925-6dec-4f66-9af7-1b2d594dc706',
            network: '1',
            qos: '',
          },
        },
      ],
      diskAttachments: [
        {
          id: 'c520f03e-0429-4102-afea-a89b1a63eb91',
          disk: {
            id: 'c520f03e-0429-4102-afea-a89b1a63eb91',
            revision: 1,
            name: 'demo-cfme-5.11.7.3-1_Disk1',
            description: '',
            selfLink:
              'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/disks/c520f03e-0429-4102-afea-a89b1a63eb91',
            shared: false,
            profile: '911d97de-3e80-40ee-b3f2-81783bea4d6b',
            storageDomain: '2',
          },
        },
        {
          id: '9174b58a-b1e5-4787-925d-d2e9d576268e',
          disk: {
            id: '9174b58a-b1e5-4787-925d-d2e9d576268e',
            revision: 1,
            name: 'demo-cfme-5.11.7.3-1_Disk2',
            description: '',
            selfLink:
              'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/disks/9174b58a-b1e5-4787-925d-d2e9d576268e',
            shared: false,
            profile: '911d97de-3e80-40ee-b3f2-81783bea4d6b',
            storageDomain: '2',
          },
        },
      ],
      concerns: [],
    },
    {
      id: 'b3eb91d4-2c42-4dc6-98fb-fee94f1df30d',
      revision: 1,
      name: 'dhcp.v2v.bos.redhat.com',
      description: 'DHCP for 10.19.2.128/25',
      selfLink:
        'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/vms/b3eb91d4-2c42-4dc6-98fb-fee94f1df30d',
      cluster: '3053b92e-23eb-11e8-959c-00163e18b6f7',
      host: '1b71b05f-ad57-4568-a3b0-83672d125ad8',
      revisionValidated: 0,
      guestName: 'Red Hat Enterprise Linux Server 7.6',
      nics: [
        {
          id: 'a437f255-0b0e-40e5-bc71-18a3d7da184e',
          name: 'nic1',
          interface: 'virtio',
          profile: {
            id: 'b3503925-6dec-4f66-9af7-1b2d594dc706',
            revision: 1,
            name: 'VM_DHCP_Network',
            description: '',
            selfLink:
              'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/nicprofiles/b3503925-6dec-4f66-9af7-1b2d594dc706',
            network: '1',
            qos: '',
          },
        },
      ],
      diskAttachments: [
        {
          id: 'f773dcdc-7c54-4c8d-8e35-d65becbc0820',
          disk: {
            id: 'f773dcdc-7c54-4c8d-8e35-d65becbc0820',
            revision: 1,
            name: 'dhcp.v2v.bos.redhat.com_Disk1',
            description: '',
            selfLink:
              'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/disks/f773dcdc-7c54-4c8d-8e35-d65becbc0820',
            shared: false,
            profile: '00deec53-1cc1-4f90-b387-6e830a5ffbd7',
            storageDomain: '3',
          },
        },
      ],
      concerns: [],
    },
    {
      id: 'be55c259-2415-448d-841e-f4b9d743242e',
      revision: 1,
      name: 'HostedEngine',
      description: '',
      selfLink:
        'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/vms/be55c259-2415-448d-841e-f4b9d743242e',
      cluster: '3053b92e-23eb-11e8-959c-00163e18b6f7',
      host: '1b71b05f-ad57-4568-a3b0-83672d125ad8',
      revisionValidated: 0,
      guestName: 'Red Hat Enterprise Linux Server 7.9',
      nics: [
        {
          id: '1794dcdd-565d-43c7-824b-ba0074855a82',
          name: 'vnet0',
          interface: 'virtio',
          profile: {
            id: '0000000a-000a-000a-000a-000000000398',
            revision: 1,
            name: 'ovirtmgmt',
            description: '',
            selfLink:
              'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/nicprofiles/0000000a-000a-000a-000a-000000000398',
            network: '2',
            qos: '',
          },
        },
        {
          id: 'af66ab23-4edc-4f45-9f70-fb3541891d1a',
          name: 'nic1',
          interface: 'virtio',
          profile: {
            id: '589ecebf-0b7c-4745-931b-e780ecb01b07',
            revision: 1,
            name: 'Storage',
            description: '',
            selfLink:
              'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/nicprofiles/589ecebf-0b7c-4745-931b-e780ecb01b07',
            network: '4',
            qos: '',
          },
        },
      ],
      diskAttachments: [
        {
          id: '33f51a02-6d51-46e6-85d7-f4864a90ae10',
          disk: {
            id: '33f51a02-6d51-46e6-85d7-f4864a90ae10',
            revision: 1,
            name: 'virtio-disk0',
            description: '',
            selfLink:
              'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/disks/33f51a02-6d51-46e6-85d7-f4864a90ae10',
            shared: false,
            profile: 'c041a7e6-e58b-4027-b17b-8849858f1be6',
            storageDomain: '4',
          },
        },
      ],
      concerns: [],
    },
    {
      id: '54426696-297d-4ae4-a2a3-c7bc43ee5ccf',
      revision: 1,
      name: 'ipam.v2v.bos.redhat.com',
      description: '',
      selfLink:
        'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/vms/54426696-297d-4ae4-a2a3-c7bc43ee5ccf',
      cluster: '3053b92e-23eb-11e8-959c-00163e18b6f7',
      host: '1b71b05f-ad57-4568-a3b0-83672d125ad8',
      revisionValidated: 0,
      guestName: 'Red Hat Enterprise Linux Server 7.5',
      nics: [
        {
          id: 'f59a55a2-c2de-4602-b852-ee85bacbda83',
          name: 'nic0',
          interface: 'virtio',
          profile: {
            id: '3831100d-bda9-475d-bfc3-6890b9b10f74',
            revision: 1,
            name: 'VM_Network',
            description: '',
            selfLink:
              'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/nicprofiles/3831100d-bda9-475d-bfc3-6890b9b10f74',
            network: '3',
            qos: '',
          },
        },
      ],
      diskAttachments: [
        {
          id: '3b4a68b9-43f5-4843-8b47-232b7ecabb12',
          disk: {
            id: '3b4a68b9-43f5-4843-8b47-232b7ecabb12',
            revision: 1,
            name: 'ipam.v2v.bos.redhat.com_Disk1',
            description: '',
            selfLink:
              'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/disks/3b4a68b9-43f5-4843-8b47-232b7ecabb12',
            shared: false,
            profile: '00deec53-1cc1-4f90-b387-6e830a5ffbd7',
            storageDomain: '3',
          },
        },
      ],
      concerns: [],
    },
    {
      id: '84d2359c-45d3-401f-a942-81020d6a58bd',
      revision: 1,
      name: 'jlabocki-master-1',
      description: '',
      selfLink:
        'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/vms/84d2359c-45d3-401f-a942-81020d6a58bd',
      cluster: '0edb53fa-232e-4145-8184-946a3736b251',
      host: '89f2f214-6d50-47e7-8e3f-6c2694ca4546',
      revisionValidated: 0,
      guestName: ' ',
      nics: [
        {
          id: 'd621bee3-871f-4abd-a0d7-144474a5b344',
          name: 'nic1',
          interface: 'virtio',
          profile: {
            id: '3831100d-bda9-475d-bfc3-6890b9b10f74',
            revision: 1,
            name: 'VM_Network',
            description: '',
            selfLink:
              'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/nicprofiles/3831100d-bda9-475d-bfc3-6890b9b10f74',
            network: '3',
            qos: '',
          },
        },
      ],
      diskAttachments: [
        {
          id: '9218ddcb-70e7-42a6-9917-fea76119c3a4',
          disk: {
            id: '9218ddcb-70e7-42a6-9917-fea76119c3a4',
            revision: 1,
            name: 'jlabocki-master-1_Disk1',
            description: '',
            selfLink:
              'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/disks/9218ddcb-70e7-42a6-9917-fea76119c3a4',
            shared: false,
            profile: '911d97de-3e80-40ee-b3f2-81783bea4d6b',
            storageDomain: '2',
          },
        },
      ],
      concerns: [],
    },
    {
      id: '25284d90-3684-4643-8f60-c72cc8ccfbff',
      revision: 1,
      name: 'jlabocki-master-3',
      description: '',
      selfLink:
        'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/vms/25284d90-3684-4643-8f60-c72cc8ccfbff',
      cluster: '0edb53fa-232e-4145-8184-946a3736b251',
      host: '89f2f214-6d50-47e7-8e3f-6c2694ca4546',
      revisionValidated: 0,
      guestName: ' ',
      nics: [
        {
          id: '20aa0ac8-bdb5-482f-8ce5-1f483ad612c6',
          name: 'nic1',
          interface: 'virtio',
          profile: {
            id: '3831100d-bda9-475d-bfc3-6890b9b10f74',
            revision: 1,
            name: 'VM_Network',
            description: '',
            selfLink:
              'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/nicprofiles/3831100d-bda9-475d-bfc3-6890b9b10f74',
            network: '3',
            qos: '',
          },
        },
      ],
      diskAttachments: [
        {
          id: '8496f2ed-263d-4ee8-adba-0c16753103e4',
          disk: {
            id: '8496f2ed-263d-4ee8-adba-0c16753103e4',
            revision: 1,
            name: 'jlabocki-master-3_Disk1',
            description: '',
            selfLink:
              'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/disks/8496f2ed-263d-4ee8-adba-0c16753103e4',
            shared: false,
            profile: '911d97de-3e80-40ee-b3f2-81783bea4d6b',
            storageDomain: '2',
          },
        },
      ],
      concerns: [],
    },
    {
      id: 'aa6eca14-b91d-447f-8050-4a7127d33244',
      revision: 1,
      name: 'jlabocki-swarm-2',
      description: '',
      selfLink:
        'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/vms/aa6eca14-b91d-447f-8050-4a7127d33244',
      cluster: '0edb53fa-232e-4145-8184-946a3736b251',
      host: '89f2f214-6d50-47e7-8e3f-6c2694ca4546',
      revisionValidated: 0,
      guestName: 'CentOS Linux 8',
      nics: [
        {
          id: 'a782a7c5-b708-405e-8874-942cc0bfd3d1',
          name: 'nic1',
          interface: 'virtio',
          profile: {
            id: 'b3503925-6dec-4f66-9af7-1b2d594dc706',
            revision: 1,
            name: 'VM_DHCP_Network',
            description: '',
            selfLink:
              'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/nicprofiles/b3503925-6dec-4f66-9af7-1b2d594dc706',
            network: '1',
            qos: '',
          },
        },
      ],
      diskAttachments: [
        {
          id: 'd0c682f1-303e-419b-ad18-ad4167bc5db6',
          disk: {
            id: 'd0c682f1-303e-419b-ad18-ad4167bc5db6',
            revision: 1,
            name: 'jlabocki-swarm-2_Disk1',
            description: '',
            selfLink:
              'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/disks/d0c682f1-303e-419b-ad18-ad4167bc5db6',
            shared: false,
            profile: '911d97de-3e80-40ee-b3f2-81783bea4d6b',
            storageDomain: '2',
          },
        },
      ],
      concerns: [],
    },
    {
      id: 'cdb41d1c-481a-4d24-a239-fe77813608cd',
      revision: 1,
      name: 'jlabocki-worker-1',
      description: '',
      selfLink:
        'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/vms/cdb41d1c-481a-4d24-a239-fe77813608cd',
      cluster: '0edb53fa-232e-4145-8184-946a3736b251',
      host: '89f2f214-6d50-47e7-8e3f-6c2694ca4546',
      revisionValidated: 0,
      guestName: ' ',
      nics: [
        {
          id: '4b65e879-2a5c-4f34-a7e8-5882e2355fe8',
          name: 'nic1',
          interface: 'virtio',
          profile: {
            id: '3831100d-bda9-475d-bfc3-6890b9b10f74',
            revision: 1,
            name: 'VM_Network',
            description: '',
            selfLink:
              'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/nicprofiles/3831100d-bda9-475d-bfc3-6890b9b10f74',
            network: '3',
            qos: '',
          },
        },
      ],
      diskAttachments: [
        {
          id: '2d1b9e45-9837-4f59-8394-d309c9ebd70a',
          disk: {
            id: '2d1b9e45-9837-4f59-8394-d309c9ebd70a',
            revision: 1,
            name: 'jlabocki-worker-1_Disk1',
            description: '',
            selfLink:
              'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/disks/2d1b9e45-9837-4f59-8394-d309c9ebd70a',
            shared: false,
            profile: '911d97de-3e80-40ee-b3f2-81783bea4d6b',
            storageDomain: '2',
          },
        },
      ],
      concerns: [],
    },
    {
      id: 'fe91d819-94e4-4e77-8d8d-399484601937',
      revision: 1,
      name: 'bthurber-kvm0.v2v.bos.redhat.com',
      description: '',
      selfLink:
        'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/vms/fe91d819-94e4-4e77-8d8d-399484601937',
      cluster: '0edb53fa-232e-4145-8184-946a3736b251',
      host: '31a5d317-8563-4824-9954-cf0b44a1596a',
      revisionValidated: 0,
      guestName: 'Red Hat Enterprise Linux Server 7.4',
      nics: [
        {
          id: '87408e44-4f3e-4a85-a637-967f34b3c0bd',
          name: 'nic1',
          interface: 'virtio',
          profile: {
            id: '589ecebf-0b7c-4745-931b-e780ecb01b07',
            revision: 1,
            name: 'Storage',
            description: '',
            selfLink:
              'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/nicprofiles/589ecebf-0b7c-4745-931b-e780ecb01b07',
            network: '4',
            qos: '',
          },
        },
        {
          id: '0d40aa42-4843-49d5-801c-0d0339fc24f7',
          name: 'nic2',
          interface: 'virtio',
          profile: {
            id: 'b3503925-6dec-4f66-9af7-1b2d594dc706',
            revision: 1,
            name: 'VM_DHCP_Network',
            description: '',
            selfLink:
              'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/nicprofiles/b3503925-6dec-4f66-9af7-1b2d594dc706',
            network: '1',
            qos: '',
          },
        },
      ],
      diskAttachments: [
        {
          id: '10564686-1464-4baa-b65a-0dc2eb4645a8',
          disk: {
            id: '10564686-1464-4baa-b65a-0dc2eb4645a8',
            revision: 1,
            name: 'bthurber-kvm0.v2v.bos.redhat.com_Disk1',
            description: '',
            selfLink:
              'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/disks/10564686-1464-4baa-b65a-0dc2eb4645a8',
            shared: false,
            profile: 'c1f27175-65f8-49a2-a3b4-707b320cdbb9',
            storageDomain: '5',
          },
        },
        {
          id: 'baa49ded-351e-49f9-a225-d1f2ce2c3e2c',
          disk: {
            id: 'baa49ded-351e-49f9-a225-d1f2ce2c3e2c',
            revision: 1,
            name: 'bthurber-kvm0.v2v.bos.redhat.com_Disk2',
            description: '',
            selfLink:
              'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/disks/baa49ded-351e-49f9-a225-d1f2ce2c3e2c',
            shared: false,
            profile: 'c1f27175-65f8-49a2-a3b4-707b320cdbb9',
            storageDomain: '5',
          },
        },
      ],
      concerns: [],
    },
    {
      id: '18d82ffd-8c1a-407a-a2c4-119b6d81375a',
      revision: 1,
      name: 'jlabocki-centos',
      description: '',
      selfLink:
        'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/vms/18d82ffd-8c1a-407a-a2c4-119b6d81375a',
      cluster: '0edb53fa-232e-4145-8184-946a3736b251',
      host: '31a5d317-8563-4824-9954-cf0b44a1596a',
      revisionValidated: 0,
      guestName: 'CentOS Linux 7.5.1804',
      nics: [
        {
          id: '4944fb50-7e10-4c6d-93c3-6d0a6224d7f7',
          name: 'nic1',
          interface: 'virtio',
          profile: {
            id: 'b3503925-6dec-4f66-9af7-1b2d594dc706',
            revision: 1,
            name: 'VM_DHCP_Network',
            description: '',
            selfLink:
              'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/nicprofiles/b3503925-6dec-4f66-9af7-1b2d594dc706',
            network: '1',
            qos: '',
          },
        },
      ],
      diskAttachments: [
        {
          id: 'e383daa8-ff33-4726-b783-d30f952a2bdd',
          disk: {
            id: 'e383daa8-ff33-4726-b783-d30f952a2bdd',
            revision: 1,
            name: 'centos-7-x64-ci_Disk1',
            description: '',
            selfLink:
              'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/disks/e383daa8-ff33-4726-b783-d30f952a2bdd',
            shared: false,
            profile: '00deec53-1cc1-4f90-b387-6e830a5ffbd7',
            storageDomain: '3',
          },
        },
      ],
      concerns: [],
    },
    {
      id: 'f9ee4c85-e880-48eb-86d4-639bf2956049',
      revision: 1,
      name: 'jlabocki-master-2',
      description: '',
      selfLink:
        'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/vms/f9ee4c85-e880-48eb-86d4-639bf2956049',
      cluster: '0edb53fa-232e-4145-8184-946a3736b251',
      host: '31a5d317-8563-4824-9954-cf0b44a1596a',
      revisionValidated: 0,
      guestName: ' ',
      nics: [
        {
          id: 'b6943f9b-7a76-4cb4-93cb-c2d9b484e4bc',
          name: 'nic1',
          interface: 'virtio',
          profile: {
            id: '3831100d-bda9-475d-bfc3-6890b9b10f74',
            revision: 1,
            name: 'VM_Network',
            description: '',
            selfLink:
              'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/nicprofiles/3831100d-bda9-475d-bfc3-6890b9b10f74',
            network: '3',
            qos: '',
          },
        },
      ],
      diskAttachments: [
        {
          id: '32695034-ee69-47e5-b272-97578640d04f',
          disk: {
            id: '32695034-ee69-47e5-b272-97578640d04f',
            revision: 1,
            name: 'jlabocki-master-2_Disk1',
            description: '',
            selfLink:
              'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/disks/32695034-ee69-47e5-b272-97578640d04f',
            shared: false,
            profile: '911d97de-3e80-40ee-b3f2-81783bea4d6b',
            storageDomain: '2',
          },
        },
      ],
      concerns: [],
    },
    {
      id: '35c259ac-603a-458e-81f6-8d9ed3a8e1ee',
      revision: 1,
      name: 'jlabocki-swarm-1',
      description: '',
      selfLink:
        'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/vms/35c259ac-603a-458e-81f6-8d9ed3a8e1ee',
      cluster: '0edb53fa-232e-4145-8184-946a3736b251',
      host: '31a5d317-8563-4824-9954-cf0b44a1596a',
      revisionValidated: 0,
      guestName: 'CentOS Linux 8',
      nics: [
        {
          id: 'ac505a52-879f-494e-915d-7d733df0fc84',
          name: 'nic1',
          interface: 'virtio',
          profile: {
            id: 'b3503925-6dec-4f66-9af7-1b2d594dc706',
            revision: 1,
            name: 'VM_DHCP_Network',
            description: '',
            selfLink:
              'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/nicprofiles/b3503925-6dec-4f66-9af7-1b2d594dc706',
            network: '1',
            qos: '',
          },
        },
      ],
      diskAttachments: [
        {
          id: '7189f2c7-21b0-443c-8724-8f4369d549b6',
          disk: {
            id: '7189f2c7-21b0-443c-8724-8f4369d549b6',
            revision: 1,
            name: 'jlabocki-swarm-1_Disk1',
            description: '',
            selfLink:
              'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/disks/7189f2c7-21b0-443c-8724-8f4369d549b6',
            shared: false,
            profile: '911d97de-3e80-40ee-b3f2-81783bea4d6b',
            storageDomain: '2',
          },
        },
      ],
      concerns: [],
    },
  ];
}
