const path = require('path')
const { merge } = require('webpack-merge')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const CompressionPlugin = require('compression-webpack-plugin')
const DotenvWebpack = require('dotenv-webpack')
const common = require('./webpack.common')

const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',

  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'js/[name].[contenthash:8].bundle.js',
    chunkFilename: 'js/[name].[contenthash:8].chunk.js',
    publicPath: '/',
    clean: true,
  },

  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },

  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          parse: { ecma: 2020 },
          compress: { ecma: 5, comparisons: false, inline: 2, drop_console: true },
          mangle: { safari10: true },
          output: { ecma: 5, comments: false, ascii_only: true },
        },
      }),
      new CssMinimizerPlugin(),
    ],
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
          chunks: 'initial',
        },
        mui: {
          test: /[\\/]node_modules[\\/](@mui|@emotion)[\\/]/,
          name: 'mui',
          priority: 20,
          chunks: 'all',
        },
        reactQuery: {
          test: /[\\/]node_modules[\\/](@tanstack)[\\/]/,
          name: 'react-query',
          priority: 20,
          chunks: 'all',
        },
        mrt: {
          test: /[\\/]node_modules[\\/](material-react-table)[\\/]/,
          name: 'mrt',
          priority: 20,
          chunks: 'all',
        },
      },
    },
    runtimeChunk: 'single',
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:8].css',
      chunkFilename: 'css/[name].[contenthash:8].chunk.css',
    }),
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 10240,
      minRatio: 0.8,
    }),
    new DotenvWebpack({ path: '.env.production', silent: true }),
    ...(process.env.ANALYZE === 'true'
      ? [new BundleAnalyzerPlugin({ analyzerMode: 'static', openAnalyzer: false })]
      : []),
  ],
})
