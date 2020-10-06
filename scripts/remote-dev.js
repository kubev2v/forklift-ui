/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const execSync = require('child_process').execSync;
const helpers = require('../config/helpers');

// Init some consts
const configDir = path.join(__dirname, '..', 'config');
const oauthclientFile = path.join(configDir, 'remote.oauthclient.templ.yaml');
const oauthClientTemplateFile = path.join(configDir, 'remote.oauthclient.templ.yaml');

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
  const virtMeta = helpers.getDevVirtMeta();
  const oauthRedirectUri = `http://localhost:${virtMeta.devServerPort}/login/callback`;

  const oauthClientName = 'mig-ui';
  const remoteDevSecret = virtMeta.oauth.clientSecret;

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

// Main

function main() {
  setupOAuthClient();
}

main();
