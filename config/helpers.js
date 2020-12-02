/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const fs = require('fs');

const sanitizeVirtMeta = (virtMeta) => {
  const oauthCopy = { ...virtMeta.oauth };
  // delete oauthCopy.clientSecret;
  return { ...virtMeta, oauth: oauthCopy };
};

const localConfigFileName = 'meta.dev.json';

const getDevVirtMeta = () => {
  if (process.env['DATA_SOURCE'] === 'mock') return { oauth: {} };
  const configPath = path.join(__dirname, localConfigFileName);
  if (!fs.existsSync(configPath)) {
    console.error('ERROR: config/meta.dev.json is missing');
    console.error(
      'Copy config/meta.dev.json.example to config/meta.dev.json' +
        ' and optionally configure your dev settings. A valid clusterUrl is ' +
        ' required for start:remote.'
    );
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(configPath));
};

const sanitizeAndEncodeVirtMeta = (virtMeta) =>
  Buffer.from(JSON.stringify(sanitizeVirtMeta(virtMeta))).toString('base64');

module.exports = { getDevVirtMeta, sanitizeAndEncodeVirtMeta };
