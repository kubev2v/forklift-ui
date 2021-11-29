/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const fs = require('fs');

const sanitizeMeta = (meta) => {
  const oauthCopy = { ...meta.oauth };
  // delete oauthCopy.clientSecret;
  return { ...meta, oauth: oauthCopy };
};

const localConfigFileName = 'meta.dev.json';

const getDevMeta = () => {
  if (process.env['DATA_SOURCE'] === 'mock') return { oauth: {} };
  const configPath = path.join(__dirname, localConfigFileName);
  if (!fs.existsSync(configPath)) {
    console.error('ERROR: packages/api/src/meta.dev.json is missing');
    console.error(
      'Copy packages/api/src/meta.dev.json.example to packages/api/src/meta.dev.json' +
        ' and optionally configure your dev settings. A valid clusterUrl is ' +
        ' required for start:remote.'
    );
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(configPath));
};

const sanitizeAndEncodeMeta = (meta) =>
  Buffer.from(JSON.stringify(sanitizeMeta(meta))).toString('base64');

const getAppTitle = () =>
  process.env['BRAND_TYPE'] === 'RedHat' ? 'Migration Toolkit for Virtualization' : 'Forklift';

const FORKLIFT_ENV = [
  'NODE_ENV',
  'DATA_SOURCE',
  'BRAND_TYPE',
  'FORKLIFT_OPERATOR_VERSION',
  'FORKLIFT_CONTROLLER_GIT_COMMIT',
  'FORKLIFT_MUST_GATHER_GIT_COMMIT',
  'FORKLIFT_OPERATOR_GIT_COMMIT',
  'FORKLIFT_UI_GIT_COMMIT',
  'FORKLIFT_VALIDATION_GIT_COMMIT',
  'FORKLIFT_CLUSTER_VERSION',
];
const FORKLIFT_SERVER_ONLY_ENV = [
  'META_FILE',
  'EXPRESS_PORT',
  'STATIC_DIR',
  'UI_TLS_ENABLED',
  'UI_TLS_KEY',
  'UI_TLS_CERTIFICATE',
];

const getEnv = (vars = FORKLIFT_ENV) =>
  vars.reduce((newObj, varName) => ({ ...newObj, [varName]: process.env[varName] }), {});
const getServerOnlyEnv = () => getEnv(FORKLIFT_SERVER_ONLY_ENV);
const getBuildEnv = () => getEnv([...FORKLIFT_ENV, ...FORKLIFT_SERVER_ONLY_ENV]);

const getEncodedEnv = () => Buffer.from(JSON.stringify(getEnv())).toString('base64');

module.exports = {
  getDevMeta,
  sanitizeAndEncodeMeta,
  getAppTitle,
  getEnv,
  getServerOnlyEnv,
  getBuildEnv,
  getEncodedEnv,
};
