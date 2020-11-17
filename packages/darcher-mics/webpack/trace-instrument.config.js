const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/trace-instrument.ts',
  output: {
    filename: 'trace-instrument.js',
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
