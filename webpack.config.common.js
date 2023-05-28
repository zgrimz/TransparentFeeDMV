const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin  = require('mini-css-extract-plugin');

module.exports = {
  // Create an entry foe each js file in src
  entry: {
    'popup': './src/popup/popup.js',
    'service-worker': './src/background/service-worker.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.(js|ts)x?$/,
        use: ['babel-loader'],
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
        exclude: /node_modules/
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
        exclude: /node_modules/
      },
    ],
  },
  plugins: [
    // clean the build folder
    new CleanWebpackPlugin({
      cleanStaleWebpackAssets: true
    }),
    new CopyPlugin({
      patterns: [
        {
          from: 'src/manifest.json',
          transform: function (content) {
            var manifestJson = JSON.parse(content.toString());
            
            manifestJson.content_security_policy.extension_pages += '; connect-src \'self\' '+  process.env.ALLOWED_CONNECT_SRC;
            
            manifestJson.version = process.env.npm_package_version;
            return Buffer.from(JSON.stringify(manifestJson));
          }
        }
      ]
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css'
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'popup', 'popup.html'),
      filename: 'popup.html',
      chunks: ['popup']
    }),
    new CopyPlugin({
      patterns: [{ from: 'static' }],
    }),
  ],
};
