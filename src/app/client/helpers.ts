import KubeClient, {
  ClientFactory,
  NamespacedResource,
  CoreNamespacedResourceKind,
  CoreNamespacedResource,
} from '@konveyor/lib-ui/dist/';
import { VIRT_META } from '@app/common/constants';
import { INewProvider, INewSecret } from '@app/queries/types';
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

export function convertFormValuesToSecret(values): INewSecret {
  // btoa => to base64, atob => from base64
  const encodedToken = btoa(values.saToken);
  return {
    apiVersion: 'v1',
    data: {
      password: values.password || 'fjkslafj',
      token: encodedToken,
      thumbprint: values.thumbprint || 'jfjasflk',
      user: values.user || 'fdashfjkhask',
    },
    kind: 'Secret',
    metadata: {
      // generateName: `${name}-`, // want to use this when it is available
      name: values.name,
      namespace: VIRT_META.namespace,
      // labels: {
      //   createdForResourceType,
      //   createdForResource,
      // },
    },
    type: 'Opaque',
  };
}

export const convertFormValuesToProvider = (formValues): INewProvider => {
  return {
    apiVersion: 'virt.konveyor.io/v1alpha1',
    kind: 'Provider',
    metadata: {
      name: formValues.name,
      namespace: 'openshift-migration',
    },
    spec: {
      type: formValues.providerType,
      url: formValues.url || formValues.hostname,
      secret: {
        namespace: VIRT_META.namespace,
        name: formValues.name,
        // this wont work when we move to generate-name ...
        // we will need to pull in secrets & find before this request
      },
    },
    type: formValues.providerType,
  };
};
