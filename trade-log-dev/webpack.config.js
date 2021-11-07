const webpack = require("webpack");
const path = require("path");
/* Plugins */
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");

module.exports = (env, options) => {
  const prod = options.mode === "production";

  return {
    entry: "./src/js/index.js",
    devtool: prod ? "source-map" : "eval-sourcemap",
    output: {
      path: path.resolve(__dirname, "public"),
      filename: "js/index.js",
      chunkFilename: "js/[name].js"
    },
    devServer: {
      contentBase: path.join(__dirname, "public"),
      publicPath: "/",
      overlay: true,
      hot: true,
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
                plugins: [
                  require("postcss-custom-properties")({ preserve: true }),
                  require("autoprefixer")(),
                  require("postcss-csso")()
                ],
                sourceMap: true
              }
            },
            "resolve-url-loader",
            // Compiles SASS to CSS
            {
              loader: "sass-loader",
              options: {
                prependData: `$fonts: '../${prod ? "" : "public/"}fonts/';`,
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
        // Images
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
      }),
      new CleanWebpackPlugin(["public/js/*"])
    ],
    optimization: {
      namedModules: true,
      namedChunks: true
    }
  }
};