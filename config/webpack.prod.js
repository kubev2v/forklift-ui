/* eslint-disable @typescript-eslint/no-var-requires */
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const { stylePaths } = require('./stylePaths');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = merge(common('production'), {
  mode: 'production',
  devtool: 'nosources-source-map',
  module: {
    rules: [
      {
        test: /\.css$/,
        include: [...stylePaths],
        use: [{ loader: MiniCssExtractPlugin.loader }, { loader: 'css-loader' }],
      },
    ],
  },
  optimization: {
    minimizer: [new TerserJSPlugin({}), `...`, new CssMinimizerPlugin()],
    sideEffects: true,
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[name].bundle.css',
    }),
    new CssMinimizerPlugin({
      minimizerOptions: {
        preset: ['default', { mergeLonghand: false }],
      },
    }),
  ],
});
