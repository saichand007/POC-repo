const path = require('path')
const { merge } = require('webpack-merge')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const DotenvWebpack = require('dotenv-webpack')
const common = require('./webpack.common')

module.exports = merge(common, {
  mode: 'development',
  devtool: 'eval-source-map',

  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].bundle.js',
    publicPath: '/',
    clean: true,
  },

  devServer: {
    port: 3000,
    hot: true,
    open: true,
    historyApiFallback: true,
    compress: true,
    client: {
      overlay: { errors: true, warnings: false },
      progress: true,
    },
    proxy: [
      {
        context: ['/api'],
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    ],
  },

  plugins: [
    new ReactRefreshWebpackPlugin(),
    new DotenvWebpack({ path: '.env.development', silent: true }),
  ],

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: ['react-refresh/babel'],
            cacheDirectory: true,
          },
        },
      },
    ],
  },

  optimization: {
    runtimeChunk: 'single',
  },
})
