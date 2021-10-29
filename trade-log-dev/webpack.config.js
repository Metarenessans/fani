const path = require("path");
const webpack = require("webpack");
/* Plugins */
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = (env, options) => {
  const prod = options.mode === "production";

  const entry = "./src/js/index.js";
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

  const plugins = [
    new webpack.DefinePlugin({ dev: !prod }),
    new MiniCssExtractPlugin({
      filename:      "css/style.css",
      chunkFilename: "css/[name].css"
    })
  ];

  return {
    entry,
    devtool,
    devServer: {
      contentBase: path.join(__dirname, ""),
      overlay: true,
      hot: true,
      // host: '192.168.0.129'
    },
    output: {
      path: path.resolve(__dirname, publicPath),
      filename: `js/index.js`,
      chunkFilename: 'js/[name].js',
      publicPath: publicPath + "/"
    },
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
          use: [prod ? MiniCssExtractPlugin.loader : "style-loader"].concat(cssPipeline)
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
    plugins,
  };
};