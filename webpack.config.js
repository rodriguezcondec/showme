const path = require('path');
var webpack = require('webpack')

module.exports = {
  entry: [
    './dist/client/app.js',
    './dist/client/camera.js',
    './dist/client/client.js',
    './dist/client/core.js',
    './dist/client/mousekeyctlr.js',
  ],
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist/client'),
  },
  devtool: "inline-source-map"
};