import { IVMwareVM } from '../types/vms.types';

export let MOCK_VMWARE_VMS: IVMwareVM[] = [];

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
}
