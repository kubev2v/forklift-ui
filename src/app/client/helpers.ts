import KubeClient, {
  ClientFactory,
  NamespacedResource,
  CoreNamespacedResourceKind,
  CoreNamespacedResource,
} from '@konveyor/lib-ui/dist/';
import { VIRT_META, ProviderType } from '@app/common/constants';
import { INewProvider, INewSecret } from '@app/queries/types';
import { VMwareFormState } from '@app/Providers/components/AddProviderModal/useVMwareFormState';
import { OpenshiftFormState } from '@app/Providers/components/AddProviderModal/useOpenshiftFormState';
export class VirtResource extends NamespacedResource {
  private _gvk: KubeClient.IGroupVersionKindPlural;
  constructor(kind: VirtResourceKind, namespace: string) {
    super(namespace);

    this._gvk = {
      group: 'virt.konveyor.io',
      version: 'v1alpha1',
      kindPlural: kind,
    };
  }
  gvk(): KubeClient.IGroupVersionKindPlural {
    return this._gvk;
  }
}
export enum VirtResourceKind {
  Provider = 'providers',
}

export const secretResource = new CoreNamespacedResource(
  CoreNamespacedResourceKind.Secret,
  VIRT_META.namespace
  //are we moving the secrets to the config namespace?
);

export const providerResource = new VirtResource(VirtResourceKind.Provider, VIRT_META.namespace);

export function convertFormValuesToSecret(
  values: VMwareFormState['values'] | OpenshiftFormState['values']
): INewSecret | undefined {
  // btoa => to base64, atob => from base64
  const encodedToken = btoa(values['saToken']);
  if (values.providerType === ProviderType.openshift) {
    return {
      apiVersion: 'v1',
      data: {
        token: encodedToken,
      },
      kind: 'Secret',
      metadata: {
        // generateName: `${name}-`, // want to use this when it is available
        name: values['clusterName'],
        namespace: VIRT_META.namespace,
        // labels: {
        //   createdForResourceType,
        //   createdForResource,
        // },
      },
      type: 'Opaque',
    };
  }
  if (values.providerType === 'vsphere') {
    const testThumbprint = 'fjdasfjasdlj';
    const encodedThumbprint = btoa(testThumbprint);
    const encodedPassword = btoa(values['password']);
    return {
      apiVersion: 'v1',
      data: {
        user: values['username'],
        password: encodedPassword,
        thumbprint: encodedThumbprint, //values.thumbprint//
      },
      kind: 'Secret',
      metadata: {
        // generateName: `${name}-`, // want to use this when it is available
        name: values['name'],
        namespace: VIRT_META.namespace,
        // labels: {
        //   createdForResourceType,
        //   createdForResource,
        // },
      },
      type: 'Opaque',
    };
  }
}

export const convertFormValuesToProvider = (
  values: OpenshiftFormState['values'] | VMwareFormState['values']
): INewProvider => {
  return {
    apiVersion: 'virt.konveyor.io/v1alpha1',
    kind: 'Provider',
    metadata: {
      name: values['clusterName'],
      namespace: 'openshift-migration',
    },
    spec: {
      type: values.providerType,
      url: values['url'] || values['hostname'],
      secret: {
        namespace: VIRT_META.namespace,
        name: values['clusterName'] || values['name'],
        // this wont work when we move to generate-name ...
        // we will need to pull in secrets & find before this request
      },
    },
  };
};
