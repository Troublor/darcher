const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/metamask-notifier.ts',
  output: {
    filename: 'metamask-notifier.js',
    path: path.resolve(__dirname, '..', 'bundle'),
    libraryTarget: 'commonjs2',
  },
  resolve: {
    modules: [
      'node_modules',
      path.join(__dirname, '..', '..', '..', 'node_modules'),
    ]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
};
