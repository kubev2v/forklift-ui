/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const fs = require('fs');
const execSync = require('child_process').execSync;

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

const generateVirtMeta = () => {
  const virtMetaJson = JSON.stringify(getLocalConfig());
  execSync(`mkdir -p ${path.join(__dirname, '../tmp')}`);
  fs.writeFileSync(path.join(__dirname, '../tmp/virtmeta.json'), virtMetaJson, 'utf8');
};

module.exports = { generateVirtMeta, getLocalConfig, getEncodedLocalConfig };
