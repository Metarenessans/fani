const path = require("path");
const fs = require("fs");

const ExtractTextPlugin = require("extract-text-webpack-plugin");
const webpack = require("webpack");

module.exports = (env, options) => {
  const prod = options.mode === "production";

  const entry = "./src/js/index.js";
  const output = "index";
  const devtool = prod ? false : "eval-sourcemap";
  const publicPath = "build";

  // Rules

  const cssPipeline = [
    // Translates CSS into CommonJS
    "css-loader?url=false",
    // PostCSS
    {
      loader: "postcss-loader",
      options: {
        plugins: [
          require("postcss-custom-properties"),
          require("autoprefixer")({
            overrideBrowserslist: ["ie >= 8", "last 4 version"]
          }),
          // require("postcss-combine-media-query"),
          require("postcss-csso"),
        ],
        // sourceMap: true
      }
    },
    "resolve-url-loader",
    // Compiles Sass to CSS
    {
      loader: "sass-loader",
      options: {
        prependData: `$fonts: '../${prod ? "" : "build/"}fonts/';`,
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

  const old = {
    entry,
    output: {
      path: path.resolve(__dirname, publicPath),
      filename: `${output}.js`,
      publicPath
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: "/node_modules/",
          use: {
            loader: "babel-loader",
            options: {
              presets: "env"
            }
          }
        },
        {
          test: /\.s[ac]ss$/i,
          use: prod
            ?
              ExtractTextPlugin.extract({
                publicPath: "/build",
                use: cssPipeline,
                fallback: "style-loader",
              })
            : ["style-loader"].concat(cssPipeline)
        },
        fontRule,
        imageRule,
      ]
    },
    plugins: [
      new ExtractTextPlugin("css/style.css")
    ]
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
          exclude: "/node_modules/",
          use: "babel-loader",
        },
        {
          test: /\.s[ac]ss$/i,
          use: prod
            ?
              ExtractTextPlugin.extract({
                publicPath: "/build",
                use: cssPipeline,
                fallback: "style-loader",
              })
            : ["style-loader"].concat(cssPipeline)
        },
        fontRule,
        imageRule,
      ]
    },
    plugins: [
      new ExtractTextPlugin("css/style.css"),
      new webpack.DefinePlugin({ dev: !prod }),
    ]
  };

  return [prod && old, modern].filter(value => !!value)
};