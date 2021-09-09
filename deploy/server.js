/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const express = require('express');
const WebSocketServer = require('ws');
const HttpsProxyAgent = require('https-proxy-agent');
const url = require('url');
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
  // target: 'http://forklift-inventory-konveyor-forklift.apps.cluster-jortel.v2v.bos.redhat.com',
  // target: 'http://localhost:9001',
  changeOrigin: true,
  // ws: true,
  // headers: {
  //   "X-Watch": ''
  // },
  pathRewrite: {
    '^/inventory-api-socket/': '/',
  },
  // logLevel: process.env.DEBUG ? 'debug' : 'info',
  logLevel: 'debug',
  secure: false,
  onError: (error) => {
    console.log('error', error);
  },
  onProxyReqWs: (proxyReq, req, socket, options, head) => {
    console.log('---------');
    console.log('onProxyReqWs');
    // console.log('onProxyReqWs', { proxyReq, req, socket, options, head });
    console.log('onProxyReqWs', options);
    // add custom header
    proxyReq.setHeader('X-Watch', 'snapshop');

    // Write out body changes to the proxyReq stream
    // proxyReq.end();
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log('---------');
    console.log('onProxyReq :)');
    // console.log('onProxyReqWs', { proxyReq, req, socket, options, head });
    // add custom header
    proxyReq.setHeader('X-Watch', 'snapshop');

    // Write out body changes to the proxyReq stream
    // proxyReq.end();
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log('---------');
    console.log('onProxyRes');
    proxyRes.headers['X-Watch'] = 'snapshot'; // add new header to response
    // proxyReq.setHeader('X-Watch', 'snapshop');
    // delete proxyRes.headers['x-removed']; // remove header from response
  },
  onOpen: (proxySocket) => {
    console.log('onOpen -----', proxySocket);
    // listen for messages coming FROM the target here
    // proxySocket.on('data', (d) => {
    //   console.log('data', d);
    // });
  },
  onClose: () => {
    console.log('onClose');
  }
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
    server: app
  });

  wss.on('connection', (ws) => {
    console.log('==================');
    console.log('WebSocketServer CONNECTION');

    ws.on('upgrade', () => {
      console.log('===============================');
      console.log('WSS UPGRADE');
    })

    ws.on('message', (msg) => {
      console.log('===============================');
      console.log('WSS MESSAGE');
    })

    ws.on('open', (msg) => {
      console.log('===============================');
      console.log('WSS OPEN');
    })

    ws.on('close', (msg) => {
      console.log('===============================');
      console.log('WSS CLOSE');
    })

    ws.send('ping');
    ws.send('pong');

  })

  wss.on('upgrade', (request, socket, head) => {
    console.log('===============================');
    console.log('WSS upgrade!!!!!!');
  })

  wss.on('open', (request, socket, head) => {
    console.log('===============================');
    console.log('WSS open!!!!!!');
  })

  wss.on('message', (request, socket, head) => {
    console.log('===============================');
    console.log('WSS message!!!!!!');
  })


  app.listen(port, () => console.log(`Express listening on port ${port}`));

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

  // server.on('close', event => {
  //   console.log('-------------------------------');
  //   console.log('express close');
  // })

  server.on('listening', () => {
    console.log('----------------------------');
    console.log('express listening');
  })

  server.on('upgrade', (request, socket, head) => {
    // const pathname = url.parse(request.url).pathname;
    console.log('----------------------------');
    console.log('express upgrade', request.url);


    wss.handleUpgrade(request, socket, head, (ws) => {
      console.log('handleUpgrade was called');
      wss.emit('connection', ws, request);
    })

    // wss.handleUpgrade(inventoryApiSocketProxy.upgrade);
    // inventoryApiSocketProxy.upgrade(request, socket, head);
  })

  // wss.on('upgrade', inventoryApiSocketProxy.upgrade)

}
