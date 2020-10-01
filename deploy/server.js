/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const express = require('express');
const fs = require('fs');
const moment = require('moment');

const helpers = require('../config/helpers');
const { sanitizeVirtMeta, getClusterAuth } = require('./oAuthHelpers');

const virtMetaFile = process.env['VIRTMETA_FILE'] || '/srv/virtmeta.json';
const virtMetaStr = fs.readFileSync(virtMetaFile, 'utf8');
const virtMeta = JSON.parse(virtMetaStr);
const sanitizedVirtMeta = sanitizeVirtMeta(virtMeta);
const encodedVirtMeta = Buffer.from(JSON.stringify(sanitizedVirtMeta)).toString('base64');
const app = express();
const port = process.env['EXPRESS_PORT'] || 8080;

require('dotenv').config();

app.engine('ejs', require('ejs').renderFile);
app.set('views', path.join(__dirname, '/dist'));
app.use(express.static(path.join(__dirname, '/dist')));

app.get('/login', async (req, res, next) => {
  try {
    const clusterAuth = await getClusterAuth(virtMeta);
    const authorizationUri = clusterAuth.authorizeURL({
      redirect_uri: virtMeta.oauth.redirectUri,
      scope: virtMeta.oauth.userScope,
    });

    res.redirect(authorizationUri);
  } catch (error) {
    console.error(error);
    const params = new URLSearchParams({ error: JSON.stringify(error) });
    const uri = `/handle-login?${params.toString()}`;
    res.redirect(uri);
    next(error);
  }
});

app.get('/login/callback', async (req, res, next) => {
  const { code } = req.query;
  const options = {
    code,
    redirect_uri: virtMeta.oauth.redirectUri,
  };
  try {
    const clusterAuth = await getClusterAuth(virtMeta);
    const accessToken = await clusterAuth.getToken(options);
    const currentUnixTime = moment().unix();
    const user = {
      ...accessToken.token,
      login_time: currentUnixTime,
      expiry_time: currentUnixTime + accessToken.token.expires_in,
    };
    const params = new URLSearchParams({ user: JSON.stringify(user) });
    const uri = `/handle-login?${params.toString()}`;
    res.redirect(uri);
  } catch (error) {
    console.error('Access Token Error', error.message);
    return res.status(500).json('Authentication failed');
  }
});

app.get('*', (req, res) => {
  if (process.env['DATA_SOURCE'] === 'mock') {
    res.sendFile(path.join(__dirname + '/dist/index.html'));
  } else {
    res.render('index.html.ejs', {
      _virt_meta: helpers.getEncodedLocalConfig(),
    });
  }
});

app.listen(port, () => console.log(`Listening on port ${port}`));
