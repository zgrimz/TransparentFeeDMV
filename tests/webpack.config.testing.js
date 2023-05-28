const { merge } = require('webpack-merge');
const Dotenv = require('dotenv-webpack');
const common = require('../webpack.config.common.js');
require('dotenv').config(
  {
    path: './tests/.env'
  }
);

module.exports = merge(common, {
  mode: 'development',
  plugins: [
    new Dotenv({
      path: './tests/.env',
    }),
  ],
  devtool: 'cheap-module-source-map',
});
