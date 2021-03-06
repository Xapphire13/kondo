const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackTagsPlugin = require('html-webpack-tags-plugin');
const CopyPlugin = require('copy-webpack-plugin');

/*
 * SplitChunksPlugin is enabled by default and replaced
 * deprecated CommonsChunkPlugin. It automatically identifies modules which
 * should be splitted of chunk by heuristics using module duplication count and
 * module category (i. e. node_modules). And splits the chunks…
 *
 * It is safe to remove "splitChunks" from the generated configuration
 * and was added as an educational example.
 *
 * https://webpack.js.org/plugins/split-chunks-plugin/
 *
 */

const baseConfig = {
  mode: 'development',
  plugins: [new webpack.ProgressPlugin()],

  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx']
  }
};

const rendererConfig = {
  ...baseConfig,
  entry: './src/renderer/index.tsx',
  plugins: [
    ...baseConfig.plugins,
    new CopyPlugin([{ from: path.resolve(__dirname, 'static'), to: 'static' }]),
    new HtmlWebpackPlugin(),
    new HtmlWebpackTagsPlugin({
      tags: 'static/index.css'
    })
  ],

  output: {
    filename: 'renderer-[name].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: './'
  },

  optimization: {
    splitChunks: {
      cacheGroups: {
        vendors: {
          priority: -10,
          test: /[\\/]node_modules[\\/]/
        }
      },

      chunks: 'all',
      minChunks: 1,
      minSize: 30000,
      name: true
    }
  },

  module: {
    rules: [
      {
        test: /.(ts|tsx)?$/,
        loader: 'ts-loader',
        exclude: [/node_modules/],
        options: {
          configFile: 'tsconfig.renderer.json'
        }
      }
    ]
  },

  target: 'electron-renderer'
};

const mainConfig = {
  ...baseConfig,

  entry: './src/index.ts',

  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist')
  },

  module: {
    rules: [
      {
        test: /.(ts|tsx)?$/,
        loader: 'ts-loader',
        exclude: [/node_modules/],
        options: {
          configFile: 'tsconfig.main.json'
        }
      }
    ]
  },

  node: {
    __dirname: false
  },

  target: 'electron-main'
};

module.exports = [rendererConfig, mainConfig];
