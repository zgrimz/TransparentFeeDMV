const { merge } = require('webpack-merge');
const Dotenv = require('dotenv-webpack');
const common = require('./webpack.config.common.js');
require('dotenv').config(
  {
    path: './src/.env'
  }
);

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new Dotenv({
      path: './src/.env'
    }),
  ],
});
