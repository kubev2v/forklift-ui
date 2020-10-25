import KubeClient, {
  ClientFactory,
  NamespacedResource,
  CoreNamespacedResourceKind,
  CoreNamespacedResource,
  ClusterClient,
} from '@konveyor/lib-ui/dist/';
import { VIRT_META, ProviderType, CLUSTER_API_VERSION } from '@app/common/constants';
import { INewProvider, INewSecret } from '@app/queries/types';
import { useNetworkContext } from '@app/common/context';
import {
  AddProviderFormValues,
  OpenshiftProviderFormValues,
  VMwareProviderFormValues,
} from '@app/Providers/components/AddProviderModal/AddProviderModal';

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
  NetworkMap = 'networkmaps',
  StorageMap = 'storagemaps',
  Plan = 'plans',
  Migration = 'migrations',
}

export const secretResource = new CoreNamespacedResource(
  CoreNamespacedResourceKind.Secret,
  VIRT_META.namespace
  //are we moving the secrets to the config namespace?
);

export const providerResource = new VirtResource(VirtResourceKind.Provider, VIRT_META.namespace);

export function convertFormValuesToSecret(
  values: AddProviderFormValues,
  createdForResourceType: VirtResourceKind
): INewSecret {
  if (values.providerType === ProviderType.openshift) {
    const openshiftValues = values as OpenshiftProviderFormValues;
    // btoa => to base64, atob => from base64
    const encodedToken = btoa(openshiftValues.saToken);
    return {
      apiVersion: 'v1',
      data: {
        token: encodedToken,
      },
      kind: 'Secret',
      metadata: {
        generateName: `${openshiftValues.clusterName}-`,
        namespace: VIRT_META.namespace,
        labels: {
          createdForResourceType,
          createdForResource: openshiftValues.clusterName,
        },
      },
      type: 'Opaque',
    };
  } else {
    //default to vmware
    const vmwareValues = values as VMwareProviderFormValues;
    const testThumbprint = 'fjdasfjasdlj';
    const encodedThumbprint = btoa(testThumbprint);
    const encodedPassword = btoa(vmwareValues.password);
    return {
      apiVersion: 'v1',
      data: {
        user: vmwareValues.username,
        password: encodedPassword,
        thumbprint: encodedThumbprint, //values.thumbprint?//
      },
      kind: 'Secret',
      metadata: {
        generateName: `${vmwareValues.name}-`,
        namespace: VIRT_META.namespace,
        labels: {
          createdForResourceType,
          createdForResource: vmwareValues.name,
        },
      },
      type: 'Opaque',
    };
  }
}

export const convertFormValuesToProvider = (
  values: AddProviderFormValues,
  providerType: ProviderType | null
): INewProvider => {
  let name: string;
  let url: string;
  if (providerType === 'vsphere') {
    const vmwareValues = values as VMwareProviderFormValues;
    name = vmwareValues.name;
    url = vmwareValues.hostname;
  } else {
    const openshiftValues = values as OpenshiftProviderFormValues;
    name = openshiftValues.clusterName;
    url = openshiftValues.url;
  }
  return {
    apiVersion: CLUSTER_API_VERSION,
    kind: 'Provider',
    metadata: {
      name,
      namespace: 'openshift-migration',
    },
    spec: {
      type: values.providerType,
      url,
      secret: {
        namespace: VIRT_META.namespace,
        name,
        // this wont work when we move to generate-name ...
        // we will need to pull in secrets & find before this request
      },
    },
  };
};

export const getTokenSecretLabelSelector = (
  createdForResourceType: string,
  createdForResource: string
): { labelSelector: string } => {
  return {
    labelSelector: `createdForResourceType=${createdForResourceType},createdForResource=${createdForResource}`,
  };
};

export const checkIfResourceExists = async (
  client: ClusterClient,
  resourceKind: VirtResourceKind | CoreNamespacedResourceKind,
  resource: VirtResource,
  resourceName: string
): Promise<void> => {
  const results = await Promise.allSettled([
    client.list(secretResource, getTokenSecretLabelSelector(resourceKind, resourceName)),
    client.get(resource, resourceName),
  ]);
  const alreadyExists = Object.keys(results).reduce(
    (exists: { kind: string; name: string }[], result) => {
      return results[result]?.status === 'fulfilled ' && results[result]?.value.status === 200
        ? [
            ...exists,
            {
              kind: results[result].value.data.kind,
              name:
                results[result].value.data.items && results[result].value.data.items.length > 0
                  ? results[result].value.data.items[0].metadata.name
                  : results[result].value.data.metadata.name,
            },
          ]
        : exists;
    },
    []
  );
  if (alreadyExists.length > 0) {
    console.error(`Resource already exists: ${resourceKind}/${resourceName}`);
    throw new Error(
      alreadyExists.reduce((msg, v) => {
        return `${msg} - kind: "${v.kind}", name: "${v.name}"`;
      }, 'Some cluster objects already exist ')
    );
  }
};

export const useClientInstance = (): KubeClient.ClusterClient => {
  const { currentUser } = useNetworkContext();
  const currentUserString = currentUser !== null ? JSON.parse(currentUser || '{}') : {};
  const user = {
    access_token: currentUserString.access_token,
    expiry_time: currentUserString.expiry_time,
  };
  return ClientFactory.cluster(user, VIRT_META.clusterApi);
};
