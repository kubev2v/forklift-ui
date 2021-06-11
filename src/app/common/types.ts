import { BrandType } from '@app/global-flags';
import { UseQueryResult } from 'react-query';

export interface IMetaVars {
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
  inventoryPayloadApi: string;
}

export interface IEnvVars {
  NODE_ENV: string;
  DATA_SOURCE: string;
  BRAND_TYPE: BrandType;
  FORKLIFT_OPERATOR_VERSION: string;
  FORKLIFT_CONTROLLER_GIT_COMMIT: string;
  FORKLIFT_MUST_GATHER_GIT_COMMIT: string;
  FORKLIFT_OPERATOR_GIT_COMMIT: string;
  FORKLIFT_UI_GIT_COMMIT: string;
  FORKLIFT_VALIDATION_GIT_COMMIT: string;
  FORKLIFT_CLUSTER_VERSION: string;
}

export type ResultSubset = Pick<
  UseQueryResult<unknown>,
  'isError' | 'isLoading' | 'isIdle' | 'error'
>;
