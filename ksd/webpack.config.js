const path = require("path");
const autoprefixer = require("autoprefixer");

var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = (env, options) => {
  var prod = options.mode === "production";
  console.log(prod);

  return {
    entry: "./src/js/main.js",
    devtool: prod ? false : "eval-sourcemap",
    output: {
      path: path.resolve(__dirname, "./dist"),
      filename: "main.min.js",
      publicPath: "dist/"
    },
    devServer: {
      hot: true,
      overlay: true,
      contentBase: path.join(__dirname, ''),
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: "/node_modules/",
          loader: "babel-loader",
          query: {
            compact: false
          },
        },
        {
          test: /\.s[ac]ss$/i,
          use: prod
            ? ExtractTextPlugin.extract({
              fallback: "style-loader",
              use: [
                // Creates `style` nodes from JS strings
                // 'style-loader',
                // Translates CSS into CommonJS
                'css-loader?url=false',
                // Autoprefixer
                {
                  loader: 'postcss-loader',
                  options: {
                    plugins: [
                      autoprefixer({
                        overrideBrowserslist: ['ie >= 8', 'last 4 version']
                      })
                    ],
                    sourceMap: true
                  }
                },
                {
                  loader: 'resolve-url-loader',
                },
                // Compiles Sass to CSS
                {
                  loader: "sass-loader",
                  options: {
                    webpackImporter: false,
                    sassOptions: {
                      outputStyle: "compressed",
                      publicPath: "./"
                    },
                  },
                }
              ]
            })
            : [
              // Creates `style` nodes from JS strings
              'style-loader',
              // Translates CSS into CommonJS
              'css-loader?url=false',
              // Autoprefixer
              {
                loader: 'postcss-loader',
                options: {
                  plugins: [
                    autoprefixer({
                      overrideBrowserslist: ['ie >= 8', 'last 4 version']
                    })
                  ],
                  sourceMap: true
                }
              },
              {
                loader: 'resolve-url-loader',
              },
              // Compiles Sass to CSS
              {
                loader: "sass-loader",
                options: {
                  webpackImporter: false,
                  sassOptions: {
                    outputStyle: "compressed",
                    publicPath: "./"
                  },
                },
              }
            ]
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          loader: 'file-loader',
          query: {
            name: '[path][name].[ext]'
          }
        },
        {
          test: /\.(png|jpe?g|gif|webp)$/,
          loader: 'file-loader',
          query: {
            name: '[path][name].[ext]'
          }
        },
      ]
    },
    plugins: [
      new ExtractTextPlugin("css/style.css")
    ]
  };
};