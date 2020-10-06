/* eslint-disable @typescript-eslint/no-var-requires */
const { AuthorizationCode } = require('simple-oauth2');
const fetch = require('node-fetch');

let cachedOAuthMeta = null;

const getOAuthMeta = async (virtMeta) => {
  if (cachedOAuthMeta) {
    return cachedOAuthMeta;
  }
  const oAuthMetaUrl = `${virtMeta.clusterApi}/.well-known/oauth-authorization-server`;
  const res = await fetch(oAuthMetaUrl).then((res) => res.json());
  cachedOAuthMeta = res;
  return cachedOAuthMeta;
};

const getClusterAuth = async (virtMeta) => {
  const oAuthMeta = await getOAuthMeta(virtMeta);
  return new AuthorizationCode({
    client: {
      id: virtMeta.oauth.clientId,
      secret: virtMeta.oauth.clientSecret,
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
