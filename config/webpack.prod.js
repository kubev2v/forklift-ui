/* eslint-disable @typescript-eslint/no-var-requires */
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const { stylePaths } = require('./stylePaths');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');

module.exports = merge(common('production'), {
  mode: 'production',
  devtool: 'source-map',
  optimization: {
    minimizer: [new TerserJSPlugin({})],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[name].bundle.css',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        include: [...stylePaths],
        use: [{ loader: MiniCssExtractPlugin.loader }, { loader: 'css-loader' }],
      },
    ],
  },
});
