'use strict'

import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import path from 'path'

module.exports = {
  context: __dirname,
  entry: './src/viewer.tsx',
  output: {
    filename: 'viewer.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: [/\.scss$/, /\.sass$/],
        exclude: /node_modules/,
        use: [
          {
            loader: 'thread-loader',
            options: {
              workers: 2,
              workerParallelJobs: 40,
              workerNodeArgs: ['--max-old-space-size=512'],
              name: 'css-loader-pool',
            },
          },
          { loader: MiniCssExtractPlugin.loader },
          { loader: 'postcss-loader' },
          { loader: 'sass-loader' },
        ],
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'thread-loader',
            options: {
              workers: 2,
              workerParallelJobs: 80,
              workerNodeArgs: ['--max-old-space-size=512'],
              name: 'ts-loader-pool',
            },
          },
          {
            loader: 'esbuild-loader',
            options: {
              loader: 'ts',
              target: 'es2015',
            },
          },
        ],
      },
      {
        test: /\.tsx$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'thread-loader',
            options: {
              workers: 2,
              workerParallelJobs: 80,
              workerNodeArgs: ['--max-old-space-size=512'],
              name: 'tsx-loader-pool',
            },
          },
          {
            loader: 'esbuild-loader',
            options: {
              loader: 'tsx',
              target: 'es2015',
            },
          },
        ],
      },
    ],
  },
}
