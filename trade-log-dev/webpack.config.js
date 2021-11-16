const path = require("path");
const webpack = require("webpack");
// Plugins
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");

/** @return {import("webpack").Configuration} */
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
    resolve: {
      alias: {
        // Фиксит краш при рендере компонентов на хуках из common
        react: path.resolve("./node_modules/react")
      }
    },
    devServer: {
      contentBase: path.join(__dirname, "public"),
      publicPath: "/",
      overlay: true,
      // Нужны для вставки стилей без перезагрузки
      inline: true,
      hot: true,
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
                prependData: `$fonts: '${prod ? "../" : ""}fonts/';`,
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