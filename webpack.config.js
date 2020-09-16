const WebpackPwaManifest = require('webpack-pwa-manifest');
const path = require('path');

const config = {
  entry: {
    db: "/public/db.js",
    index: '/public/index.js',
    transaction: '/models/transaction.js',
  },
  output: {
    path: __dirname + '/dist',
    filename: '[name].bundle.js',
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  plugins: [
    new WebpackPwaManifest({
      fingerprints: false,
      name: 'Offline budget app',
      short_name: 'Budget',
      description: 'An application that allows you to track your earnings and spendings.',
      background_color: '#01579b',
      theme_color: '#ffffff',
      'theme-color': '#ffffff',
      start_url: '/',
      icons: [
        {
          src: path.resolve('./public/icons/android-chrome-192x192.png'),
          sizes: [192, 512],
          destination: path.join('public', 'icons'),
        },
      ],
    }),
  ],
};

module.exports = config;
