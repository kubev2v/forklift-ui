export interface IVirtMetaVars {
  clusterApi: string;
  devServerPort: string;
  oauth: {
    clientId: string;
    redirectUri: string;
    userScope: string;
    clientSecret: string;
  };
  namespace: string;
  configNamespace: string;
  inventoryApi: string;
}
