const path = require('path');
const CamundaModelerWebpackPlugin = require("camunda-modeler-webpack-plugin");

module.exports = {
  mode: 'development',
  entry: './client/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'client.js'
  },
  devtool: 'cheap-module-source-map',
  module: {
    rules: [
      {
        test: /\.(txt|csv)$/,
        use: [
          {
            loader: 'file-loader',
            options: {}
          }
        ]
      },
      {
        test: /\.bpmn$/,
        use: {
          loader: 'raw-loader'
        }
      },
      {
        test: /\.(jpg|png|gif|svg)$/i,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 8192,
              mimetype: "image/png",
              encoding: true,
            },
          },
        ]
      },
    ]
  },
  plugins: [
    new CamundaModelerWebpackPlugin()
  ],
};
