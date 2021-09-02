/* eslint-disable @typescript-eslint/no-var-requires */
const { AuthorizationCode } = require('simple-oauth2');
const fetch = require('node-fetch');
// import { AuthorizationCode } from 'simple-oauth2';
// import fetch from 'node-fetch';

let cachedOAuthMeta = null;

const getOAuthMeta = async (meta) => {
  if (cachedOAuthMeta) {
    return cachedOAuthMeta;
  }
  const oAuthMetaUrl = `${meta.clusterApi}/.well-known/oauth-authorization-server`;
  const res = await fetch(oAuthMetaUrl).then((res) => res.json());
  cachedOAuthMeta = res;
  return cachedOAuthMeta;
};

export const getClusterAuth = async (meta) => {
  const oAuthMeta = await getOAuthMeta(meta);
  return new AuthorizationCode({
    client: {
      id: meta.oauth.clientId,
      secret: meta.oauth.clientSecret,
    },
    auth: {
      tokenHost: oAuthMeta.token_endpoint,
      authorizePath: oAuthMeta.authorization_endpoint,
    },
  });
};

module.exports = {
  getClusterAuth,
};
