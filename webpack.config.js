const path = require("path");
const webpack = require("webpack");

const webConfig = /** @type WebpackConfig */ {
  context: __dirname,
  mode: "none", // this leaves the source code as close as possible to the original (when packaging we set this to 'production')
  target: "webworker", // web extensions run in a webworker context
  entry: {
    "extension-web": "./web/code.js", // source of the web extension main file
  },
  output: {
    filename: "[name].js",
    path: path.join(__dirname, "./dist"),
    libraryTarget: "commonjs",
  },
  resolve: {
    mainFields: ["browser", "module", "main"], // look for `browser` entry point in imported node modules
    extensions: [".ts", ".js"], // support ts-files and js-files
    alias: {
      // provides alternate implementation for node module and source files
    },
    fallback: {
      // Webpack 5 no longer polyfills Node.js core modules automatically.
      // see https://webpack.js.org/configuration/resolve/#resolvefallback
      // for the list of Node.js core module polyfills.
    //   assert: require.resolve("assert"),
      "assert": false,
	  "net": false,
	  "tls": false,
	  "http": false,
	  "https": false,
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/, // Обрабатывать файлы .js
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader", // Используйте babel-loader для транспиляции JavaScript
            options: {
              presets: ["@babel/preset-env"], // Для поддержки последних возможностей JavaScript
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: "process/browser", // provide a shim for the global `process` variable
    }),
  ],
  externals: {
    vscode: "commonjs vscode", // ignored because it doesn't exist
  },
  performance: {
    hints: false,
  },
  devtool: "nosources-source-map", // create a source map that points to the original source file
};
const nodeConfig = {
	context: __dirname,
	mode: "none",
	target: "node",
	entry: {
	  "extension-node": "./src/.initExtension.js", // Измените эти пути к файлам на ваши собственные
	  // Убедитесь, что указали правильные пути к вашим входным файлам
	},
	output: {
	  filename: "[name].js",
	  path: path.join(__dirname, "./dist"),
	  libraryTarget: "commonjs",
	},
	resolve: {
	  mainFields: ["module", "main"],
	  extensions: [".js"], // Только файлы JS
	},
	module: {
	  rules: [
		{
		  test: /\.js$/, // Транспиляция файлов .js с помощью Babel
		  exclude: /node_modules/,
		  use: [
			{
			  loader: "babel-loader",
			  options: {
				presets: ["@babel/preset-env"],
			  },
			},
		  ],
		},
	  ],
	},
	externals: {
	  vscode: "commonjs vscode",
	  mocha: "commonjs mocha",
	  '@vscode/test-electron': "commonjs @vscode/test-electron",
	},
	performance: {
	  hints: false,
	},
	devtool: "nosources-source-map",
  };

module.exports = [webConfig, nodeConfig];