/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const express = require('express');
const app = express();
const port = process.env['EXPRESS_PORT'] || 8080;

require('dotenv').config();

app.engine('ejs', require('ejs').renderFile);
app.set('views', path.join(__dirname, '/dist'));
app.use(express.static(path.join(__dirname, '/dist')));

// NOTE: Any future backend-only routes here need to also be proxied by webpack-dev-server.
//       Add them to config/webpack.dev.js in the array under devServer.proxy.context.
app.get('/hello', (req, res) => {
  // TODO remove this /hello example once we have some real routes here
  res.send('Hello from Express!');
});

app.get('*', (req, res) => {
  if (process.env['DATA_SOURCE'] === 'mock') {
    res.sendFile(path.join(__dirname + '/dist/index.html'));
  } else {
    res.render('index.html.ejs', {
      _env_encoded: require('./runtime-env-vars'),
    });
  }
});

app.listen(port, () => console.log(`Listening on port ${port}`));
