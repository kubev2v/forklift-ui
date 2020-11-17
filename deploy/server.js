/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const express = require('express');
const https = require('https');
const fs = require('fs');
const dayjs = require('dayjs');

const helpers = require('../config/helpers');
const { getClusterAuth } = require('./oAuthHelpers');

const { createProxyMiddleware } = require('http-proxy-middleware');

let virtMetaStr;
if (process.env['DATA_SOURCE'] === 'mock') {
  virtMetaStr = '{ "oauth": {} }';
} else {
  const virtMetaFile = process.env['VIRTMETA_FILE'] || '/srv/virtMeta.json';
  virtMetaStr = fs.readFileSync(virtMetaFile, 'utf8');
}

const virtMeta = JSON.parse(virtMetaStr);

const app = express();
const port = process.env['EXPRESS_PORT'] || 8080;
const staticDir = process.env['STATIC_DIR'] || path.join(__dirname, '../dist');

app.engine('ejs', require('ejs').renderFile);
app.use(express.static(staticDir));

if (process.env['DATA_SOURCE'] !== 'mock') {
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

  app.get('/login/callback', async (req, res) => {
    const { code } = req.query;
    const options = {
      code,
      redirect_uri: virtMeta.oauth.redirectUri,
    };
    try {
      const clusterAuth = await getClusterAuth(virtMeta);
      const accessToken = await clusterAuth.getToken(options);
      const currentUnixTime = dayjs().unix();
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
}

if (process.env['DATA_SOURCE'] !== 'mock') {
  let clusterApiProxyOptions = {
    target: virtMeta.clusterApi,
    changeOrigin: true,
    pathRewrite: {
      '^/cluster-api/': '/',
    },
    logLevel: process.env.DEBUG ? 'debug' : 'info',
  };

  let inventoryApiProxyOptions = {
    target: virtMeta.inventoryApi,
    changeOrigin: true,
    pathRewrite: {
      '^/inventory-api/': '/',
    },
    logLevel: process.env.DEBUG ? 'debug' : 'info',
  };

  let inventoryPayloadApiProxyOptions = {
    target: virtMeta.inventoryPayloadApi,
    changeOrigin: true,
    pathRewrite: {
      '^/inventory-payload-api/': '/',
    },
    logLevel: process.env.DEBUG ? 'debug' : 'info',
  };

  if (process.env['NODE_ENV'] === 'development') {
    clusterApiProxyOptions = {
      ...clusterApiProxyOptions,
      secure: false,
    };

    inventoryApiProxyOptions = {
      ...inventoryApiProxyOptions,
      secure: false,
    };

    inventoryPayloadApiProxyOptions = {
      ...inventoryPayloadApiProxyOptions,
      secure: false,
    };
  }

  const clusterApiProxy = createProxyMiddleware(clusterApiProxyOptions);
  const inventoryApiProxy = createProxyMiddleware(inventoryApiProxyOptions);
  const inventoryPayloadApiProxy = createProxyMiddleware(inventoryPayloadApiProxyOptions);

  app.use('/cluster-api/', clusterApiProxy);
  app.use('/inventory-api/', inventoryApiProxy);
  app.use('/inventory-payload-api/', inventoryPayloadApiProxy);
}

app.get('*', (_, res) => {
  if (process.env['NODE_ENV'] === 'development' || process.env['DATA_SOURCE'] === 'mock') {
    // In dev and mock-prod modes, window._virt_meta was populated at build time
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  } else {
    res.render('index.html.ejs', {
      _virt_meta: helpers.sanitizeAndEncodeVirtMeta(virtMeta),
    });
  }
});

if (process.env['NODE_ENV'] !== 'development' && process.env['DATA_SOURCE'] !== 'mock') {
  const options = {
    key: fs.readFileSync('/var/run/secrets/migration-ui-tls/tls.key'),
    cert: fs.readFileSync('/var/run/secrets/migration-ui-tls/tls.crt'),
  };
  https.createServer(options, app).listen(8443);
} else {
  app.listen(port, () => console.log(`Listening on port ${port}`));
}
