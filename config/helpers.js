/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const fs = require('fs');

const localConfigFileName = 'virtMeta.dev.json';

const getLocalConfig = () => {
  const configPath = path.join(__dirname, localConfigFileName);
  if (!fs.existsSync(configPath)) {
    console.error('ERROR: config/virtMeta.dev.json is missing');
    console.error(
      'Copy config/virtMeta.dev.json.example to config/virtMeta.dev.json' +
        ' and optionally configure your dev settings. A valid clusterUrl is ' +
        ' required for start:remote.'
    );
    process.exit(1);
  }
  const localConfig = require(configPath);
  return localConfig;
};

const getEncodedLocalConfig = (localConfig) =>
  Buffer.from(JSON.stringify(getLocalConfig())).toString('base64');

module.exports = { getLocalConfig, getEncodedLocalConfig };
