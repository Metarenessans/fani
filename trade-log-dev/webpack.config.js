const webpack = require("webpack");
const path = require("path");
// Plugins
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = (env, options) => {
  const prod = options.mode === "production";

  const fileLoaderOptions = {
    loader: "file-loader",
    query: {
      name: "[path][name].[ext]"
    }
  }

  return {
    entry: "./src/js/index.js",
    output: {
      path: path.resolve(__dirname, "public"),
      filename: "js/index.js"
    },
    devServer: {
      contentBase: "./public",
      publicPath: "/public/js/",
      overlay: true
    },
    devtool: prod ? "source-map" : "eval-sourcemap",
    target: "web",
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              rootMode: "upward",
              compact: false,
            }
          }
        },
        {
          test: /\.s[ac]ss$/i,
          use: [
            process.env.NODE_ENV !== "production"
              ? "style-loader"
              : MiniCssExtractPlugin.loader,
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
          ]
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          ...fileLoaderOptions
        },
        {
          test: /\.(png|jpe?g|gif|webp)$/,
          ...fileLoaderOptions
        }
      ]
    },
    plugins: [
      new webpack.DefinePlugin({ dev: !prod }),
      new MiniCssExtractPlugin({
        filename: "[name].css",
        chunkFilename: "[name].css",
      }),
      new CleanWebpackPlugin(["public/js/*"])
    ]
  }
};