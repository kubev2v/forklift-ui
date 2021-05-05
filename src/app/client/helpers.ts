import Q from 'q';
import KubeClient, {
  ClientFactory,
  NamespacedResource,
  CoreNamespacedResourceKind,
  CoreNamespacedResource,
} from '@konveyor/lib-ui';
import { META, ProviderType, CLUSTER_API_VERSION } from '@app/common/constants';
import { IProviderObject, ISecret } from '@app/queries/types';
import { useNetworkContext } from '@app/common/context';
import {
  AddProviderFormValues,
  OpenshiftProviderFormValues,
  VMwareProviderFormValues,
} from '@app/Providers/components/AddEditProviderModal/AddEditProviderModal';
import { AuthorizedClusterClient } from './types';
import { nameAndNamespace } from '@app/queries/helpers';

export class ForkliftResource extends NamespacedResource {
  private _gvk: KubeClient.IGroupVersionKindPlural;
  constructor(kind: ForkliftResourceKind, namespace: string) {
    super(namespace);

    this._gvk = {
      group: 'forklift.konveyor.io',
      version: 'v1beta1',
      kindPlural: kind,
    };
  }
  gvk(): KubeClient.IGroupVersionKindPlural {
    return this._gvk;
  }
}
export enum ForkliftResourceKind {
  Provider = 'providers',
  NetworkMap = 'networkmaps',
  StorageMap = 'storagemaps',
  Plan = 'plans',
  Migration = 'migrations',
  Host = 'hosts',
  Provisioners = 'provisioners',
  Hook = 'hooks',
}

export const secretResource = new CoreNamespacedResource(
  CoreNamespacedResourceKind.Secret,
  META.namespace
  //are we moving the secrets to the config namespace?
);

export const providerResource = new ForkliftResource(ForkliftResourceKind.Provider, META.namespace);

export function convertFormValuesToSecret(
  values: AddProviderFormValues,
  createdForResourceType: ForkliftResourceKind,
  providerBeingEdited: IProviderObject | null
): ISecret {
  const ownerReferences = !providerBeingEdited
    ? []
    : [
        {
          apiVersion: CLUSTER_API_VERSION,
          kind: 'Provider',
          name: providerBeingEdited.metadata.name,
          namespace: providerBeingEdited.metadata.namespace,
          uid: providerBeingEdited.metadata.uid,
        },
      ];
  if (values.providerType === ProviderType.openshift) {
    const openshiftValues = values as OpenshiftProviderFormValues;
    // btoa => to base64, atob => from base64
    const encodedToken = openshiftValues.saToken && btoa(openshiftValues.saToken);
    return {
      apiVersion: 'v1',
      data: {
        token: encodedToken,
      },
      kind: 'Secret',
      metadata: {
        ...(!providerBeingEdited
          ? {
              generateName: `${openshiftValues.name}-`,
              namespace: META.namespace,
            }
          : nameAndNamespace(providerBeingEdited.spec.secret)),
        labels: {
          createdForResourceType,
          createdForResource: openshiftValues.name,
        },
        ownerReferences,
      },
      type: 'Opaque',
    };
  } else {
    // default to vmware
    const vmwareValues = values as VMwareProviderFormValues;
    const encodedUser = vmwareValues.username && btoa(vmwareValues.username);
    const encodedPassword = vmwareValues.password && btoa(vmwareValues.password);
    const encodedThumbprint = vmwareValues.fingerprint && btoa(vmwareValues.fingerprint);
    return {
      apiVersion: 'v1',
      data: {
        user: encodedUser,
        password: encodedPassword,
        thumbprint: encodedThumbprint,
      },
      kind: 'Secret',
      metadata: {
        ...(!providerBeingEdited
          ? { generateName: `${vmwareValues.name}-`, namespace: META.namespace }
          : nameAndNamespace(providerBeingEdited.spec.secret)),
        labels: {
          createdForResourceType,
          createdForResource: vmwareValues.name,
        },
        ownerReferences,
      },
      type: 'Opaque',
    };
  }
}

export const vmwareUrlToHostname = (url: string): string => {
  const match = url.match(/^https:\/\/(.+)\/sdk$/);
  return match ? match[1] : url;
};
export const vmwareHostnameToUrl = (hostname: string): string => `https://${hostname}/sdk`;

export const convertFormValuesToProvider = (
  values: AddProviderFormValues,
  providerType: ProviderType | null
): IProviderObject => {
  let name: string;
  let url: string;
  if (providerType === 'vsphere') {
    const vmwareValues = values as VMwareProviderFormValues;
    name = vmwareValues.name;
    url = vmwareHostnameToUrl(vmwareValues.hostname);
  } else {
    const openshiftValues = values as OpenshiftProviderFormValues;
    name = openshiftValues.name;
    url = openshiftValues.url;
  }
  return {
    apiVersion: CLUSTER_API_VERSION,
    kind: 'Provider',
    metadata: {
      name,
      namespace: META.namespace,
    },
    spec: {
      type: values.providerType,
      url,
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
  client: AuthorizedClusterClient,
  resourceKind: ForkliftResourceKind | CoreNamespacedResourceKind,
  resource: ForkliftResource,
  resourceName: string
): Promise<void> => {
  const results = await Q.allSettled([
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
  return ClientFactory.cluster(user, '/cluster-api');
};
