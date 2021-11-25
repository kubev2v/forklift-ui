/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const webpack = require('webpack');
const BG_IMAGES_DIRNAME = 'bgimages';
const helpers = require('./helpers');

console.log('\nEnvironment at build time:');
console.log(helpers.getBuildEnv());

module.exports = (env) => {
  return {
    entry: {
      app: ['react-hot-loader/patch', path.resolve(__dirname, '../packages/web/src/index.tsx')],
    },
    module: {
      rules: [
        {
          test: /\.(tsx|ts|jsx)?$/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                transpileOnly: true,
                experimentalWatchApi: true,
              },
            },
          ],
        },
        {
          test: /\.(svg|ttf|eot|woff|woff2)$/,
          // only process modules with this loader
          // if they live under a 'fonts' or 'pficon' directory
          include: [
            path.resolve(__dirname, '../node_modules/patternfly/dist/fonts'),
            path.resolve(
              __dirname,
              '../node_modules/@patternfly/react-core/dist/styles/assets/fonts'
            ),
            path.resolve(
              __dirname,
              '../node_modules/@patternfly/react-core/dist/styles/assets/pficon'
            ),
            path.resolve(__dirname, '../node_modules/@patternfly/patternfly/assets/fonts'),
            path.resolve(__dirname, '../node_modules/@patternfly/patternfly/assets/pficon'),
          ],
          use: {
            loader: 'file-loader',
            options: {
              // Limit at 50k. larger files emited into separate files
              limit: 5000,
              outputPath: 'fonts',
              name: '[name].[ext]',
            },
          },
        },
        {
          test: /\.svg$/,
          include: (input) => input.indexOf('background-filter.svg') > 1,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 5000,
                outputPath: 'svgs',
                name: '[name].[ext]',
              },
            },
          ],
          type: 'javascript/auto',
        },
        {
          test: /\.svg$/,
          // only process SVG modules with this loader if they live under a 'bgimages' directory
          // this is primarily useful when applying a CSS background using an SVG
          include: (input) => input.indexOf(BG_IMAGES_DIRNAME) > -1,
          use: {
            loader: 'svg-url-loader',
            options: {},
          },
        },
        {
          test: /\.svg$/,
          // only process SVG modules with this loader when they don't live under a 'bgimages',
          // 'fonts', or 'pficon' directory, those are handled with other loaders
          include: (input) =>
            input.indexOf(BG_IMAGES_DIRNAME) === -1 &&
            input.indexOf('fonts') === -1 &&
            input.indexOf('background-filter') === -1 &&
            input.indexOf('pficon') === -1,
          use: {
            loader: 'raw-loader',
            options: {},
          },
          type: 'javascript/auto',
        },
        {
          test: /\.(jpg|jpeg|png|gif)$/i,
          include: [
            path.resolve(__dirname, '../packages/web/src'),
            path.resolve(__dirname, '../node_modules/patternfly'),
            path.resolve(__dirname, '../node_modules/@patternfly/patternfly/assets/images'),
            path.resolve(__dirname, '../node_modules/@patternfly/react-styles/css/assets/images'),
            path.resolve(
              __dirname,
              '../node_modules/@patternfly/react-core/dist/styles/assets/images'
            ),
            path.resolve(
              __dirname,
              '../node_modules/@patternfly/react-core/node_modules/@patternfly/react-styles/css/assets/images'
            ),
            path.resolve(
              __dirname,
              '../node_modules/@patternfly/react-table/node_modules/@patternfly/react-styles/css/assets/images'
            ),
            path.resolve(
              __dirname,
              '../node_modules/@patternfly/react-inline-edit-extension/node_modules/@patternfly/react-styles/css/assets/images'
            ),
          ],
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 5000,
                outputPath: 'images',
                name: '[name].[ext]',
              },
            },
          ],
          type: 'javascript/auto',
        },
      ],
    },
    output: {
      filename: '[name].bundle.js',
      path: path.resolve(__dirname, '../dist'),
    },
    plugins: [
      new HtmlWebpackPlugin({
        ...(env === 'development' || process.env.DATA_SOURCE === 'mock'
          ? {
              // In dev and mock-prod modes, populate window._meta and window._env at build time
              filename: 'index.html',
              template: path.resolve(__dirname, '../packages/web/src/index.html.ejs'),
              templateParameters: {
                _meta: helpers.sanitizeAndEncodeMeta(helpers.getDevMeta()),
                _env: helpers.getEncodedEnv(),
                _app_title: helpers.getAppTitle(),
              },
            }
          : {
              // In real prod mode, populate window._meta and window._env at run time with express
              filename: 'index.html.ejs',
              template: `!!raw-loader!${path.resolve(
                __dirname,
                '../packages/web/src/index.html.ejs'
              )}`,
            }),
        favicon: path.resolve(
          __dirname,
          process.env.BRAND_TYPE === 'RedHat'
            ? '../packages/web/src/favicon-redhat.ico'
            : '../packages/web/src/favicon-konveyor.ico'
        ),
      }),
      new webpack.EnvironmentPlugin({
        DATA_SOURCE: 'remote',
        BRAND_TYPE: 'Konveyor',
        NODE_ENV: 'production',
      }),
    ],
    resolve: {
      alias: {
        'react-dom': '@hot-loader/react-dom',
      },
      extensions: ['.js', '.ts', '.tsx', '.jsx'],
      plugins: [
        new TsconfigPathsPlugin({
          configFile: path.resolve(__dirname, '../packages/web/tsconfig.json'),
        }),
      ],
      symlinks: false,
      cacheWithContext: false,
      fallback: { crypto: false },
    },
  };
};
