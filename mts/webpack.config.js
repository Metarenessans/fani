/** @type {import("webpack").Configuration} */

const webpack = require("webpack");

const path = require("path");
/* Plugins */
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = (env, options) => {
  const prod = options.mode === "production";
  const publicPath = "public/";

  return {
    entry: "./src/js/index.js",
    devtool: prod ? "source-map" : "eval-source-map",
    output: {
      path: path.resolve(__dirname, publicPath),
      filename: `js/index.js`,
      chunkFilename: 'js/[name].js'
    },
    devServer: {
      port: 1337,
      contentBase: path.join(__dirname, "public"),
      open: true
      // host: '192.168.0.129'
    },
    module: {
      rules: [
        // JS
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              rootMode: "upward",
            }
          }
        },
        // CSS
        {
          test: /\.s[ac]ss$/i,
          use: [
            prod ? MiniCssExtractPlugin.loader : "style-loader",
            // Translates CSS into CommonJS
            "css-loader?url=false",
            // PostCSS
            {
              loader: "postcss-loader",
              options: {
                postcssOptions: {
                  plugins: [
                    require("postcss-custom-properties")({ preserve: true }),
                    require("autoprefixer")(),
                    prod && require("cssnano")()
                  ],
                },
                sourceMap: true
              }
            },
            "resolve-url-loader",
            // Compiles SASS to CSS
            {
              loader: "sass-loader",
              options: {
                webpackImporter: false,
                sassOptions: { outputStyle: "expanded" },
              },
            }
          ]
        },
        // Fonts
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          loader: "file-loader",
          options: {
            name: "[path][name].[ext]"
          }
        },
        // Graphics
        {
          test: /\.(png|jpe?g|gif|webp)$/,
          loader: "file-loader",
          options: {
            name: "[path][name].[ext]"
          }
        }
      ]
    },
    plugins: [
      new webpack.DefinePlugin({ dev: !prod }),
      new MiniCssExtractPlugin({
        filename: "css/style.css",
        chunkFilename: "css/[name].css"
      })
    ],
    optimization: {
      minimize: prod,
      minimizer: [new TerserPlugin({
        terserOptions: {
          format: {
            comments: false
          },
        },
        extractComments: false
      })]
    },
  }
};