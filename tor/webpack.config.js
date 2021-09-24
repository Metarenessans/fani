const path = require("path");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const webpack = require("webpack");

module.exports = (env, options) => {
  const prod = options.mode === "production";

  const entry = "./src/js/index.js";
  const output = "index";
  const devtool = prod ? "source-map" : "eval-source-map";
  const publicPath = "public";

  // Rules

  const cssPipeline = [
    // Translates CSS into CommonJS
    "css-loader?url=false",
    // PostCSS
    {
      loader: "postcss-loader",
      options: {
        plugins: [
          require("postcss-custom-properties")(),
          require("autoprefixer")({
            overrideBrowserslist: ["ie >= 8", "last 4 version"]
          }),
          require("postcss-csso"),
        ],
        sourceMap: true
      }
    },
    "resolve-url-loader",
    // Compiles Sass to CSS
    {
      loader: "sass-loader",
      options: {
        prependData: `$fonts: '../${prod ? "" : "public/"}fonts/';`,
        webpackImporter: false,
        sassOptions: {
          publicPath: "./",
          outputStyle: "expanded",
        },
      },
    }
  ];

  const fontRule = {
    test: /\.(woff|woff2|eot|ttf|otf)$/,
    loader: "file-loader",
    query: {
      name: "[path][name].[ext]"
    }
  };

  const imageRule = {
    test: /\.(png|jpe?g|gif|webp)$/,
    loader: "file-loader",
    query: {
      name: "[path][name].[ext]"
    }
  };

  const plugins = [
    new webpack.DefinePlugin({ dev: !prod }),
    new ExtractTextPlugin("css/style.css"),
  ];

  const old = {
    entry,
    output: {
      path: path.resolve(__dirname, publicPath),
      filename: `${output}.js`,
      publicPath
    },
    devtool,
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: "/node_modules/",
          use: {
            loader: "babel-loader",
            options: {
              presets: [
                "@babel/preset-env",
                "@babel/preset-react"
              ]
            }
          }
        },
        {
          test: /\.s[ac]ss$/i,
          use: prod
            ?
              ExtractTextPlugin.extract({
                publicPath: "/public",
                use: cssPipeline,
                fallback: "style-loader",
              })
            : ["style-loader"].concat(cssPipeline)
        },
        fontRule,
        imageRule,
      ]
    },
    plugins
  };

  const modern = {
    entry,
    devtool,
    output: {
      path: path.resolve(__dirname, publicPath),
      filename: `${output}-es6.js`,
      publicPath
    },
    devServer: {
      contentBase: path.join(__dirname, ""),
      overlay: true,
      hot: true,
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: [
                "@babel/preset-react"
              ]
            }
          }
        },
        {
          test: /\.s[ac]ss$/i,
          use: prod
            ?
              ExtractTextPlugin.extract({
                publicPath: "/public",
                use: cssPipeline,
                fallback: "style-loader",
              })
            : ["style-loader"].concat(cssPipeline)
        },
        fontRule,
        imageRule,
      ]
    },
    plugins
  };

  return [prod && old, modern].filter(value => !!value)
};