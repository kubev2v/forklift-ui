/* eslint-disable @typescript-eslint/no-var-requires */
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const { stylePaths } = require('./stylePaths');
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || '9000';
const EXPRESS_PORT = process.env.EXPRESS_PORT || 9001;

module.exports = merge(common('development'), {
  mode: 'development',
  devtool: 'eval-source-map',
  devServer: {
    contentBase: './dist',
    host: HOST,
    port: PORT,
    compress: true,
    inline: true,
    historyApiFallback: true,
    hot: true,
    overlay: true,
    open: true,
    proxy: [
      {
        // NOTE: Any future backend-only routes added to server.js need to be listed here:
        context: [
          '/login',
          '/login/callback',
          '/cluster-api',
          '/inventory-api',
          '/inventory-api-socket',
          '/inventory-payload-api',
        ],
        target: `http://localhost:${EXPRESS_PORT}`,
        // ws: true
      },
      // {
      //   context: [
      //     '/inventory-api-socket',
      //   ],
      //   target: `http://localhost:${EXPRESS_PORT}`,
      //   ws: true,
      //   secure: true,
      // }
    ],
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        include: [...stylePaths],
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
});
