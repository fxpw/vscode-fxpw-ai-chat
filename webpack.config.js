const path = require('path');
const webpack = require('webpack');

/** @typedef {import('webpack').Configuration} WebpackConfig **/
/** @type WebpackConfig */
const webExtensionConfig = {
  mode: 'none', // this leaves the source code as close as possible to the original (when packaging we set this to 'production')
  target: 'webworker', // extensions run in a webworker context
  entry: {
    extension: './ts/initExtension.ts', // source of the web extension main file
  },
  output: {
    filename: '[name].js',
    path: path.join(__dirname, './out/web'),
    libraryTarget: 'commonjs',
    devtoolModuleFilenameTemplate: '../../[resource-path]'
  },
  resolve: {
    mainFields: ['browser', 'module', 'main'], // look for `browser` entry point in imported node modules
    extensions: ['.ts','.js'], // support ts-files and js-files
    alias: {
      // provides alternate implementation for node module and source files
    },
    fallback: {
      // Webpack 5 no longer polyfills Node.js core modules automatically.
      // see https://webpack.js.org/configuration/resolve/#resolvefallback
      // for the list of Node.js core module polyfills.
		assert: require.resolve('assert'),
		buffer: require.resolve('buffer'),
		console: require.resolve('console-browserify'),
		constants: require.resolve('constants-browserify'),
		crypto: require.resolve('crypto-browserify'),
		domain: require.resolve('domain-browser'),
		events: require.resolve('events'),
		http: require.resolve('stream-http'),
		https: require.resolve('https-browserify'),
		os: require.resolve('os-browserify/browser'),
		path: require.resolve('path-browserify'),
		punycode: require.resolve('punycode'),
		process: require.resolve('process/browser'),
		querystring: require.resolve('querystring-es3'),
		stream: require.resolve('stream-browserify'),
		string_decoder: require.resolve('string_decoder'),
		sys: require.resolve('util'),
		timers: require.resolve('timers-browserify'),
		tty: require.resolve('tty-browserify'),
		url: require.resolve('url'),
		util: require.resolve('util'),
		vm: require.resolve('vm-browserify'),
		zlib: require.resolve('browserify-zlib'),
		net: false,
		tls: false,
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser' // provide a shim for the global `process` variable
    })
  ],
  externals: {
    vscode: 'commonjs vscode', // ignored because it doesn't exist
    // Exclude Node.js specific modules that don't work in browser
    fs: 'commonjs fs',
    dns: 'commonjs dns',
    // Exclude problematic proxy agent
    'socks-proxy-agent': 'commonjs socks-proxy-agent',
    'https-proxy-agent': 'commonjs https-proxy-agent'
  },
  performance: {
    hints: false
  },
  devtool: 'nosources-source-map' // create a source map that points to the original source file
};
module.exports = [webExtensionConfig];