import {
  IVMwareNetwork,
  IVMwareNetworksByProvider,
  ICNVNetworksByProvider,
  ICNVNetwork,
  NetworkType,
} from '../types';

const someVMwareNetworks: IVMwareNetwork[] = [
  { id: '1', name: 'vmware-network-1' },
  { id: '2', name: 'vmware-network-2' },
  { id: '3', name: 'vmware-network-3' },
  { id: '4', name: 'vmware-network-4' },
  { id: '5', name: 'vmware-network-5' },
];

export const MOCK_VMWARE_NETWORKS_BY_PROVIDER: IVMwareNetworksByProvider = {
  VCenter1: [...someVMwareNetworks],
  VCenter2: [...someVMwareNetworks],
  VCenter3: [...someVMwareNetworks],
};

const someCNVNetworks: ICNVNetwork[] = [
  { type: NetworkType.Pod, name: 'ocp-pod-network-1', namespace: 'ocp-namespace-1' },
  { type: NetworkType.Pod, name: 'ocp-pod-network-2', namespace: 'ocp-namespace-1' },
  { type: NetworkType.Multis, name: 'ocp-multis-network-1', namespace: 'ocp-namespace-1' },
  { type: NetworkType.Multis, name: 'ocp-multis-network-2', namespace: 'ocp-namespace-1' },
];

export const MOCK_CNV_NETWORKS_BY_PROVIDER: ICNVNetworksByProvider = {
  OCPv_1: [...someCNVNetworks],
  OCPv_2: [...someCNVNetworks],
  OCPv_3: [...someCNVNetworks],
};
