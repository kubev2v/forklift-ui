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

const sanitizeAndEncodeMeta = (meta) =>
  Buffer.from(JSON.stringify(sanitizeMeta(meta))).toString('base64');

module.exports = { getDevMeta, sanitizeAndEncodeMeta };
