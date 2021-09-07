/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const express = require('express');
// import express from 'express';
// import { WebSocketServer } from 'ws';
const WebSocketServer = require('ws');
// const WebSocketServer = require('websocket').server;
const https = require('https');
const http = require('http');
const fs = require('fs');
const dayjs = require('dayjs');

const helpers = require('../config/helpers');
const { getClusterAuth } = require('./oAuthHelpers');

const { createProxyMiddleware } = require('http-proxy-middleware');

let metaStr;
if (process.env['DATA_SOURCE'] === 'mock') {
  metaStr = '{ "oauth": {} }';
} else {
  const metaFile = process.env['META_FILE'] || '/srv/meta.json';
  metaStr = fs.readFileSync(metaFile, 'utf8');
}

console.log('\nEnvironment at run time:\n');
console.log('Available to server and browser:', helpers.getEnv());
console.log('Available to server only:', helpers.getServerOnlyEnv());

const meta = JSON.parse(metaStr);
console.log('\nValues from meta.json:', meta);

const app = express();
const port =
  process.env['EXPRESS_PORT'] || (process.env['UI_TLS_ENABLED'] !== 'false' ? 8443 : 8080);
const staticDir = process.env['STATIC_DIR'] || path.join(__dirname, '../dist');

app.engine('ejs', require('ejs').renderFile);
app.use(express.static(staticDir));

if (process.env['DATA_SOURCE'] !== 'mock') {
  app.get('/login', async (req, res, next) => {
    try {
      const clusterAuth = await getClusterAuth(meta);
      const authorizationUri = clusterAuth.authorizeURL({
        redirect_uri: meta.oauth.redirectUrl,
        scope: meta.oauth.userScope,
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
      redirect_uri: meta.oauth.redirectUrl,
    };
    try {
      const clusterAuth = await getClusterAuth(meta);
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

let inventoryApiProxyOptions$ = {
  target: meta.inventoryApi,
  changeOrigin: true,
  ws: true,
  pathRewrite: {
    '^/inventory-api-socket/': '/',
  },
  logLevel: process.env.DEBUG ? 'debug' : 'info',
};

inventoryApiProxyOptions$ = {
  ...inventoryApiProxyOptions$,
  secure: false,
};

const inventoryApiSocketProxy = createProxyMiddleware(inventoryApiProxyOptions$);

if (process.env['DATA_SOURCE'] !== 'mock') {
  let clusterApiProxyOptions = {
    target: meta.clusterApi,
    changeOrigin: true,
    pathRewrite: {
      '^/cluster-api/': '/',
    },
    logLevel: process.env.DEBUG ? 'debug' : 'info',
  };

  let inventoryApiProxyOptions = {
    target: meta.inventoryApi,
    changeOrigin: true,
    pathRewrite: {
      '^/inventory-api/': '/',
    },
    logLevel: process.env.DEBUG ? 'debug' : 'info',
  };

  /* TODO restore this when https://github.com/konveyor/forklift-ui/issues/281 is settled
  let inventoryPayloadApiProxyOptions = {
    target: meta.inventoryPayloadApi,
    changeOrigin: true,
    pathRewrite: {
      '^/inventory-payload-api/': '/',
    },
    logLevel: process.env.DEBUG ? 'debug' : 'info',
  };
  */

  if (process.env['NODE_ENV'] === 'development') {
    clusterApiProxyOptions = {
      ...clusterApiProxyOptions,
      secure: false,
    };

    inventoryApiProxyOptions = {
      ...inventoryApiProxyOptions,
      secure: false,
    };

    /* TODO restore this when https://github.com/konveyor/forklift-ui/issues/281 is settled
    inventoryPayloadApiProxyOptions = {
      ...inventoryPayloadApiProxyOptions,
      secure: false,
    };
    */
  }

  const clusterApiProxy = createProxyMiddleware(clusterApiProxyOptions);
  const inventoryApiProxy = createProxyMiddleware(inventoryApiProxyOptions);
  // TODO restore this when https://github.com/konveyor/forklift-ui/issues/281 is settled
  // const inventoryPayloadApiProxy = createProxyMiddleware(inventoryPayloadApiProxyOptions);

  app.use('/cluster-api/', clusterApiProxy);
  app.use('/inventory-api/', inventoryApiProxy);
  app.use('/inventory-api-socket/', inventoryApiSocketProxy);
  // TODO restore this when https://github.com/konveyor/forklift-ui/issues/281 is settled
  // app.use('/inventory-payload-api/', inventoryPayloadApiProxy);
}

app.get('*', (_, res) => {
  if (process.env['NODE_ENV'] === 'development' || process.env['DATA_SOURCE'] === 'mock') {
    // In dev and mock-prod modes, window._meta and window._env were populated at build time
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  } else {
    res.render('index.html.ejs', {
      _meta: helpers.sanitizeAndEncodeMeta(meta),
      _env: helpers.getEncodedEnv(),
      _app_title: helpers.getAppTitle(),
    });
  }
});

if (
  process.env['UI_TLS_ENABLED'] !== 'false' &&
  process.env['NODE_ENV'] !== 'development' &&
  process.env['DATA_SOURCE'] !== 'mock'
) {
  const options = {
    key: fs.readFileSync(
      process.env['UI_TLS_KEY'] || '/var/run/secrets/forklift-ui-serving-cert/tls.key'
    ),
    cert: fs.readFileSync(
      process.env['UI_TLS_CERTIFICATE'] || '/var/run/secrets/forklift-ui-serving-cert/tls.crt'
    ),
  };
  https.createServer(options, app).listen(port);
} else {

  const server = http.createServer(app);
  const wss = new WebSocketServer.Server({
    server: app,
    // port: port
    // noServer: true
  });

  wss.on('connection', (ws) => {
    console.log('==================');
    console.log('connection EVENT RAN');

    ws.on('upgrade', () => {
      console.log('UPGRADE INSIDE WS');
    })

    ws.on('message', (msg) => {
      console.log('MESSAGE INSIDE WS');
    })

    ws.on('open', (msg) => {
      console.log('OPEN INSIDE WS');
    })

    ws.on('close', (msg) => {
      console.log('CLOSE INSIDE WS');
    })

  })

  server.listen(port, () => console.log(`Listening on port ${port}`));

  server.on('error', event => {
    console.log('????????????????????????????????');
    console.log(event);
    console.log('express THERE WAS AN ERROR WITH THE WS CONNECTION');
  })

  server.on('connection', socket => {
    console.log('-------------------------------');
    console.log('express connection');
    // socket.on('connect', event => {
    //   console.log('CONNECT event');
    // })
  });

  server.on('close', event => {
    console.log('===============================');
    console.log('express WS connection CLOSED');
  })

  server.on('listening', () => {
    console.log('----------------------------');
    console.log('express WS listening');
  })

  server.on('upgrade', (request, socket, head) => {
    console.log('----------------------------');
    console.log('express WS upgrade');
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    })

  })

  // server.on('upgrade', inventoryApiSocketProxy.upgrade)

}
