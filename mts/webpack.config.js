/** @type {import("webpack").Configuration} */

const webpack = require("webpack");

const path = require("path");
const sass = require("sass");
const postcss = require("postcss");
/* Plugins */
const CopyPlugin = require("copy-webpack-plugin");

const MiniCssExtractPlugin = require("mini-css-extract-plugin");

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
        postcssOptions: {
          plugins: [
            require("postcss-custom-properties")({ preserve: true }),
            require("autoprefixer")(),
            // require("cssnano")()
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
  ];

  const fontRule = {
    test: /\.(woff|woff2|eot|ttf|otf)$/,
    loader: "file-loader",
    options: {
      name: "[path][name].[ext]"
    }
  };

  const imageRule = {
    test: /\.(png|jpe?g|gif|webp)$/,
    loader: "file-loader",
    options: {
      name: "[path][name].[ext]"
    }
  };

  const plugins = [
    new webpack.DefinePlugin({ dev: !prod }),
    new MiniCssExtractPlugin({ filename: "css/style.css" }),
    new CopyPlugin({
      patterns: [
        {
          from: "src/index.html",
          to: path.resolve(__dirname, publicPath)
        }
      ],
    }),
  ];

  const modern = {
    entry,
    devtool,
    output: {
      path: path.resolve(__dirname, publicPath),
      filename: `js/${output}-es6.js`,
      publicPath
    },
    devServer: {
      port: 3000,
      contentBase: path.join(__dirname, publicPath),
      writeToDisk: true,
      //host: '192.168.0.129'
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
            ? [MiniCssExtractPlugin.loader,].concat(cssPipeline)
            : ["style-loader"].concat(cssPipeline)
        },
        fontRule,
        imageRule,
      ]
    },
    plugins
  };

  if (prod) {
    const old = { ...modern };

    old.output.filename = `js/${output}.js`;

    old.module.rules = old.module.rules.map(rule => {
      if (String(rule.test) == "/\\.js$/") {
        rule.use.options?.presets?.push("@babel/preset-env");
      }
      return rule;
    });

    delete old.devtool;
    delete old.devServer;

    return [modern, old];
  }

  return modern;
};