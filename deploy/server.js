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

const { createProxyMiddleware, fixRequestBody, responseInterceptor } = require('http-proxy-middleware');

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
  headers: {
    'X-Watch': 'snapshot',
    // 'Connection': 'Upgrade',
    // 'Upgrade': 'websocket'
  },
  // pathRewrite: (path, req) => path.replace('/foo', '/bar'),
  // toProxy: true,
  pathRewrite: {
    '^/inventory-api-socket/': '/',
  },
  // logLevel: process.env.DEBUG ? 'debug' : 'info',
  logLevel: 'debug',
  secure: false,
  // https://www.npmjs.com/package/http-proxy#listening-for-proxy-events
  onError: (error) => {
    console.log('inventoryApiProxyOptions$ onError', error);
  },
  onProxyReqWs: (proxyReq, req, socket, options, head) => {
    // console.log('---------');
    // console.log('onProxyReqWs');
    // console.log('onProxyReqWs', { proxyReq, req, socket, options, head });
    // console.log('onProxyReqWs', options);
    // add custom header
    proxyReq.setHeader('X-Watch', 'snapshot');
    proxyReq.setHeader('Connection', 'Upgrade');
    proxyReq.setHeader('Upgrade', 'websocket');
  },
  onProxyReq: (proxyReq, req, res) => {
    // console.log('---------');
    // console.log('onProxyReq ran (set X-Watch)');
    // console.log('onProxyReqWs', { proxyReq, req, socket, options, head });
    // add custom header
    proxyReq.setHeader('X-Watch', 'snapshot');
    proxyReq.setHeader('Connection', 'Upgrade');
    proxyReq.setHeader('Upgrade', 'websocket');
  },
  // followRedirects: true,
  // selfHandleResponse: true,
  // onProxyRes: responseInterceptor(async () => {
  //   // log original request and proxied request info
  //   const exchange = `[DEBUG] ${req.method} ${req.path} -> ${proxyRes.req.protocol}//${proxyRes.req.host}${proxyRes.req.path} [${proxyRes.statusCode}]`;
  //   console.log(exchange); // [DEBUG] GET / -> http://www.example.com [200]
  //   // log complete response
  //   const response = responseBuffer.toString('utf8');
  //   console.log(response);
  //   return responseBuffer;
  // }),
  // onProxyRes: (proxyRes, req, res) => {
  //   // console.log('---------');
  //   // console.log('onProxyRes');
  //   proxyRes.headers['X-Watch'] = 'snapshot'; // add new header to response
  //   // delete proxyRes.headers['x-removed']; // remove header from response
  // },
  // onOpen: (proxySocket) => {
  //   console.log('onOpen inventoryApiProxyOptions$', proxySocket);
  //   // listen for messages coming FROM the target here
  //   // proxySocket.on('data', (d) => {
  //   //   console.log('data', d);
  //   // });
  // },
  // onClose: () => {
  //   console.log('onClose');
  // }
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

    // inventoryApiProxyOptions$ = {
    //   ...inventoryApiProxyOptions,
    //   secure: false,
    // };

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

  const httpServer = http.createServer(app);
  const expressServer = app.listen(port, () => console.log(`Express listening on port ${port}`));

  // https://github.com/websockets/ws/issues/1787
  const wss = new WebSocketServer.Server({
    // clientTracking: true,
    // path: 'inventory-api-socket',
    // server: httpServer, // allows for calling // wss.handleUpgrade() manually
    server: expressServer, // works without handleUpgrade
    // noServer: true // allows for calling // wss.handleUpgrade() manually
  });

  // wss.on('message', (msg) => {
  //   console.log('wss received a message');
  // });

  // wss.on('connection', (ws, request) => {
  //   console.log('==================');
  //   console.log('[wss] CONNECTION');

  //   ws.on('upgrade', () => {
  //     console.log('===============================');
  //     console.log('[wss] UPGRADE');
  //   })

  //   ws.on('message', (msg) => {
  //     console.log('===============================');
  //     console.log('[wss] MESSAGE', msg.toString());
  //     // wss.clients.forEach(client => {
  //     //   client.send(msg.toString());
  //     // });
  //   })

  //   ws.on('open', (msg) => {
  //     console.log('===============================');
  //     console.log('[wss] OPEN');
  //   })

  //   ws.on('close', (msg) => {
  //     console.log('===============================');
  //     console.log('[wss] CLOSE');
  //   })

  //   ws.send('ping');
  //   ws.send('pong');
  // })


  // httpServer.on('upgrade', (request, socket, head) => {
  //   console.log('httpServer upgraded');
  //   // wss.handleUpgrade(request, socket, head, (ws) => {
  //   //   wss.emit('connection', ws, request);
  //   // })
  // });

  // expressServer.on('upgrade', (request, socket, head) => {
  //   console.log('expressServer upgraded');
  //   // wss.handleUpgrade(request, socket, head, (ws) => {
  //   //   wss.emit('connection', ws, request);
  //   // })
  // });

  expressServer.on('upgrade', (request, socket, head) => {
    inventoryApiSocketProxy.upgrade(request, socket, head);
  });

}
