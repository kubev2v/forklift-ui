/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const execSync = require('child_process').execSync;
const helpers = require('../config/helpers');

// Init some consts
const configDir = path.join(__dirname, '..', 'config');
const oauthclientFile = path.join(configDir, 'remote.oauthclient.templ.yaml');
const remoteConfigFile = path.join(configDir, 'virtMeta.dev.json');
const oauthClientTemplateFile = path.join(configDir, 'remote.oauthclient.templ.yaml');

// Validations
if (!fs.existsSync(remoteConfigFile)) {
  console.error(`ERROR: Remote config file ${remoteConfigFile} is missing`);
  console.error(`You could should copy the example to that location and edit with desired config`);
  process.exit(1);
}

try {
  execSync('hash oc');
} catch (error) {
  console.error(error.stdout.toString());
  process.exit(1);
}

try {
  execSync('oc whoami');
} catch (error) {
  console.error('ERROR: A problem occurred while trying to log into openshift cluster:');
  console.error('This script uses the oc cli tool, are you logged in with oc login <cluster>?');
  process.exit(1);
}

// Helpers

function setupOAuthClient() {
  const remoteConfig = JSON.parse(fs.readFileSync(remoteConfigFile));
  const oauthRedirectUri = `http://localhost:${remoteConfig.devServerPort}/login/callback`;

  const oauthClientName = 'mig-ui';
  const remoteDevSecret = remoteConfig.oauth.clientSecret;

  try {
    console.log(`Checking to see if ${oauthClientName} oauthclient exists in cluster...`);
    execSync(`oc get oauthclient ${oauthClientName} -o json`);
    console.log('Found existing OAuthClient object in cluster');
    console.log('Deleting existing OAuthClient so it can be reset');
    execSync(`oc delete oauthclient ${oauthClientName}`);
  } catch (error) {
    // Some error other than the client not existing occurred
    if (!error.stderr.toString().includes('not found')) {
      console.error('ERROR: Something went wrong while trying to get the remote-dev oauthclient:');
      console.error(error.stdout.toString());
      process.exit(1);
    }
  }

  console.log(`Attempting to create oauthclient for ${oauthClientName} ...`);
  // NOTE: Not providing a secret since we are a public client, defined
  // as one *without* a secret. Will implement PKCE.
  const oauthClient = {
    apiVersion: 'oauth.openshift.io/v1',
    kind: 'OAuthClient',
    metadata: {
      name: oauthClientName,
    },
    grantMethod: 'auto', // consider 'prompt'?
    redirectURIs: [oauthRedirectUri],
    secret: remoteDevSecret,
  };

  // Configure OAuthClient in remote cluster
  try {
    execSync(`echo '${JSON.stringify(oauthClient)}' | oc create -f-`);
  } catch (error) {
    console.error('ERROR: Something went wrong trying to create a new OAuthClient:');
    console.error(error.stdout.toString());
    process.exit(1);
  }
}

function generateVirtMeta() {
  console.log('helpers.getLocalConfig()', helpers.getLocalConfig());
  const virtMetaJson = JSON.stringify(helpers.getLocalConfig());
  execSync(`mkdir -p ${path.join(__dirname, '../tmp')}`);
  fs.writeFileSync(path.join(__dirname, '../tmp/virtmeta.json'), virtMetaJson, 'utf8');
}

// Main

function main() {
  setupOAuthClient();
  generateVirtMeta();
}

main();
