import { CLUSTER_API_VERSION, META } from '@app/common/constants';
import { nameAndNamespace } from '../helpers';
import { IHost, IHostConfig } from '../types/hosts.types';
import { MOCK_INVENTORY_PROVIDERS } from './providers.mock';

export let MOCK_HOSTS: IHost[] = [];
export let MOCK_HOST_CONFIGS: IHostConfig[] = [];

if (process.env.NODE_ENV === 'test' || process.env.DATA_SOURCE === 'mock') {
  const host1: IHost = {
    id: 'host-44',
    parent: { kind: 'Cluster', id: 'domain-c26' },
    revision: 1,
    name: 'esx12.v2v.bos.redhat.com',
    selfLink: '/providers/vsphere/test/hosts/host-44',
    inMaintenance: false,
    managementServerIp: '10.19.2.10',
    thumbprint: 'D3:47:18:B1:11:39:87:25:F4:52:B2:04:EC:85:88:FA:9D:78:73:11',
    cpuSockets: 2,
    cpuCores: 16,
    productName: 'VMware ESXi',
    productVersion: '6.5.0',
    networking: {
      vNICs: [
        { key: 'key-vim.host.PhysicalNic-vmnic0', linkSpeed: 10000 },
        { key: 'key-vim.host.PhysicalNic-vmnic1', linkSpeed: 10000 },
        { key: 'key-vim.host.PhysicalNic-vmnic2', linkSpeed: 10000 },
        { key: 'key-vim.host.PhysicalNic-vmnic3', linkSpeed: 10000 },
        { key: 'key-vim.host.PhysicalNic-vmnic4', linkSpeed: 1000 },
        { key: 'key-vim.host.PhysicalNic-vmnic6', linkSpeed: 1000 },
        { key: 'key-vim.host.PhysicalNic-vmnic7', linkSpeed: 1000 },
      ],
      pNICs: [
        {
          key: 'key-vim.host.VirtualNic-vmk2',
          portGroup: 'VM_Migration',
          dPortGroup: '',
          ipAddress: '192.168.79.12',
          mtu: 9000,
        },
        {
          key: 'key-vim.host.VirtualNic-vmk0',
          portGroup: 'Management Network',
          dPortGroup: '',
          ipAddress: '10.19.2.12',
          mtu: 1500,
        },
        {
          key: 'key-vim.host.VirtualNic-vmk1',
          portGroup: 'VMkernel',
          dPortGroup: '',
          ipAddress: '172.31.2.12',
          mtu: 1500,
        },
        {
          key: 'key-vim.host.VirtualNic-vmk3',
          portGroup: '',
          dPortGroup: 'dvportgroup-48',
          ipAddress: '192.168.61.12',
          mtu: 1500,
        },
      ],
      portGroups: [
        {
          key: 'key-vim.host.PortGroup-VM Network',
          name: 'VM Network',
          vSwitch: 'key-vim.host.VirtualSwitch-vSwitch0',
        },
        {
          key: 'key-vim.host.PortGroup-Management Network',
          name: 'Management Network',
          vSwitch: 'key-vim.host.VirtualSwitch-vSwitch0',
        },
        {
          key: 'key-vim.host.PortGroup-VM_DHCP_Network',
          name: 'VM_DHCP_Network',
          vSwitch: 'key-vim.host.VirtualSwitch-vSwitch1',
        },
        {
          key: 'key-vim.host.PortGroup-VM_Storage',
          name: 'VM_Storage',
          vSwitch: 'key-vim.host.VirtualSwitch-vSwitch1',
        },
        {
          key: 'key-vim.host.PortGroup-VM_10G_Network',
          name: 'VM_10G_Network',
          vSwitch: 'key-vim.host.VirtualSwitch-vSwitch1',
        },
        {
          key: 'key-vim.host.PortGroup-VMkernel',
          name: 'VMkernel',
          vSwitch: 'key-vim.host.VirtualSwitch-vSwitch1',
        },
        {
          key: 'key-vim.host.PortGroup-VM_Isolated_67',
          name: 'VM_Isolated_67',
          vSwitch: 'key-vim.host.VirtualSwitch-vSwitch2',
        },
        {
          key: 'key-vim.host.PortGroup-VM_Migration',
          name: 'VM_Migration',
          vSwitch: 'key-vim.host.VirtualSwitch-vSwitch2',
        },
      ],
      switches: [
        {
          key: 'key-vim.host.VirtualSwitch-vSwitch0',
          name: 'vSwitch0',
          portGroups: [
            'key-vim.host.PortGroup-VM Network',
            'key-vim.host.PortGroup-Management Network',
          ],
          pNICs: ['key-vim.host.PhysicalNic-vmnic4'],
        },
        {
          key: 'key-vim.host.VirtualSwitch-vSwitch1',
          name: 'vSwitch1',
          portGroups: [
            'key-vim.host.PortGroup-VM_DHCP_Network',
            'key-vim.host.PortGroup-VM_Storage',
            'key-vim.host.PortGroup-VM_10G_Network',
            'key-vim.host.PortGroup-VMkernel',
          ],
          pNICs: ['key-vim.host.PhysicalNic-vmnic1', 'key-vim.host.PhysicalNic-vmnic0'],
        },
        {
          key: 'key-vim.host.VirtualSwitch-vSwitch2',
          name: 'vSwitch2',
          portGroups: [
            'key-vim.host.PortGroup-VM_Isolated_67',
            'key-vim.host.PortGroup-VM_Migration',
          ],
          pNICs: ['key-vim.host.PhysicalNic-vmnic3', 'key-vim.host.PhysicalNic-vmnic2'],
        },
      ],
    },
    networks: [
      { kind: 'Network', id: 'network-31' },
      { kind: 'Network', id: 'network-34' },
      { kind: 'Network', id: 'network-723' },
      { kind: 'Network', id: 'network-57' },
      { kind: 'Network', id: 'network-33' },
      { kind: 'Network', id: 'dvportgroup-47' },
      { kind: 'Network', id: 'dvportgroup-48' },
      { kind: 'Network', id: 'dvportgroup-49' },
      { kind: 'Network', id: 'dvportgroup-53' },
      { kind: 'Network', id: 'dvportgroup-56' },
      { kind: 'Network', id: 'dvportgroup-54' },
      { kind: 'Network', id: 'dvportgroup-55' },
    ],
    datastores: [
      { kind: 'Datastore', id: 'datastore-35' },
      { kind: 'Datastore', id: 'datastore-63' },
      { kind: 'Datastore', id: 'datastore-45' },
    ],
    vms: [
      { kind: 'VM', id: 'vm-2867' },
      { kind: 'VM', id: 'vm-2781' },
      { kind: 'VM', id: 'vm-2861' },
      { kind: 'VM', id: 'vm-2860' },
      { kind: 'VM', id: 'vm-2851' },
      { kind: 'VM', id: 'vm-2847' },
      { kind: 'VM', id: 'vm-74' },
      { kind: 'VM', id: 'vm-2858' },
      { kind: 'VM', id: 'vm-2834' },
      { kind: 'VM', id: 'vm-2849' },
    ],
    networkAdapters: [
      {
        name: 'VM_Migration',
        ipAddress: '192.168.79.12',
        linkSpeed: 10000,
        mtu: 9000,
        subnetMask: '255.255.255.0',
      },
      {
        name: 'VMkernel',
        ipAddress: '172.31.2.12',
        linkSpeed: 10000,
        mtu: 1500,
        subnetMask: '255.255.255.0',
      },
      {
        name: 'vDS-1',
        ipAddress: '192.168.61.12',
        linkSpeed: 10000,
        mtu: 1500,
        subnetMask: '255.255.255.0',
      },
      {
        name: 'Management Network',
        ipAddress: '10.19.2.12',
        linkSpeed: 1000,
        mtu: 1500,
        subnetMask: '255.255.255.0',
      },
    ],
  };

  const host2 = {
    ...host1,
    id: 'host-29',
    name: 'esx13.v2v.bos.redhat.com',
    selfLink: '/providers/vsphere/test/hosts/host-29',
  };

  MOCK_HOSTS = [host1, host2];

  MOCK_HOST_CONFIGS = [
    {
      apiVersion: CLUSTER_API_VERSION,
      kind: 'Host',
      metadata: {
        name: `host-${host1.id}-config`,
        namespace: META.namespace,
      },
      spec: {
        id: host1.id,
        ipAddress: host1.networkAdapters[0].ipAddress,
        provider: nameAndNamespace(MOCK_INVENTORY_PROVIDERS.vsphere[0]),
        secret: {
          name: 'mock-secret',
          namespace: 'openshift-migration',
        },
      },
    },
  ];
}
