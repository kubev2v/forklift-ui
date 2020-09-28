// Variables from .env specified here will be served to the client in window['_env'] at run-time.
// This is then exported as a typed constant RUNTIME_ENV from @app/common/constants.ts.
// These vars MUST be referenced in UI code from RUNTIME_ENV instead of process.env (build-time values).
// Be sure to also add new variables to IRuntimeEnvVars in @app/common/types.ts.

const runtimeVars = ['INVENTORY_API_URL', 'CLUSTER_API_URL'];

module.exports = Buffer.from(
  JSON.stringify(runtimeVars.reduce((newObj, key) => ({ ...newObj, [key]: process.env[key] }), {}))
).toString('base64');
